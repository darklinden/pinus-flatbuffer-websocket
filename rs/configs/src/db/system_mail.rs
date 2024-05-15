#![allow(dead_code)]

use anyhow::Result;
use sea_orm::*;
use std::collections::HashMap;
use std::collections::HashSet;

use entities::system_mail;

use database::db_util::FromEntTrait;
use utils::time::now_sec;

extern crate flatbuffers;

#[derive(Debug, Clone)]
pub struct SystemMailItem {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub active_time: i64,
    pub expire_time: i64,
    pub rewards: HashMap<i32, i64>,
}

impl FromEntTrait<system_mail::Model> for SystemMailItem {
    fn from_ent(ent: &system_mail::Model) -> Self {
        let mut dto = Self {
            id: ent.id,
            title: ent.title.to_owned(),
            content: ent.content.to_owned(),
            active_time: ent.active_time,
            expire_time: ent.expire_time,
            rewards: HashMap::new(),
        };

        if ent.reward_types.len() != ent.reward_values.len() {
            log::error!(
                "SystemMailItem from_ent reward_types.len != reward_values.len: mail id {}",
                ent.id
            );
        }

        let n = std::cmp::min(ent.reward_types.len(), ent.reward_values.len());
        for i in 0..n {
            dto.rewards
                .insert(ent.reward_types[i], ent.reward_values[i]);
        }

        dto
    }
}

#[derive(Debug, Clone)]
pub struct SystemMailSegmentData {
    // 当前数据
    pub time_start: i64,
    pub time_end: i64,
    pub data: Vec<SystemMailItem>,
}

#[macro_markers::mark_config]
#[derive(Debug, Clone)]
pub struct SystemMail {
    // <ID, SystemMailItem>
    detail_map: HashMap<i64, SystemMailItem>,

    // <时间段, <活动类型, 活动数据>>
    // 时间分段数据
    mail_to_send: Vec<SystemMailSegmentData>,
}

impl SystemMail {
    /// return Vec<{start_time, end_time, Vec<SystemMailItem>}>
    fn get_groups_active(items: &[SystemMailItem]) -> Vec<SystemMailSegmentData> {
        // all the time points
        let mut time_points: HashSet<i64> = HashSet::new();
        // items group by the start time
        let mut starts: HashMap<i64, Vec<usize>> = HashMap::new();
        // items group by the end time
        let mut ends: HashMap<i64, Vec<usize>> = HashMap::new();

        // Iterate over each item
        for (index, item) in items.iter().enumerate() {
            time_points.insert(item.active_time);
            time_points.insert(item.expire_time);

            // Add the item's ID to the start time group
            starts.entry(item.active_time).or_default().push(index);

            // Add the item's ID to the end time group
            ends.entry(item.expire_time).or_default().push(index);
        }

        let mut time_points = time_points.into_iter().collect::<Vec<_>>();
        time_points.sort();

        let mut time_start = -1;
        let mut time_end;
        let mut active_items = HashSet::new();
        let mut active_groups = Vec::new();

        for time in time_points {
            let old_active_items = active_items.clone();
            let mut has_changed = false;
            // Remove items that have ended
            if let Some(ended_items) = ends.get(&time) {
                for item in ended_items {
                    active_items.remove(item);
                }
                has_changed = true;
            }

            // Add items that have started
            if let Some(started_items) = starts.get(&time) {
                for item in started_items {
                    active_items.insert(*item);
                }
                has_changed = true;
            }

            if has_changed {
                if !old_active_items.is_empty() {
                    time_end = time;
                    active_groups.push(SystemMailSegmentData {
                        time_start,
                        time_end,
                        data: old_active_items.iter().map(|&i| items[i].clone()).collect(),
                    });
                }
                time_start = time;
            }
        }

        active_groups
    }

    pub async fn load_data(pg: &DatabaseConnection) -> Result<Self> {
        let now_sec = now_sec();

        let models = system_mail::Entity::find()
            .filter(system_mail::Column::IsActive.eq(1))
            .all(pg)
            .await?;

        let mut detail_map = HashMap::new();
        let mut items = vec![];
        for model in models {
            let mut item = SystemMailItem::from_ent(&model);
            if item.active_time == -1 {
                item.active_time = 0;
            }
            if item.expire_time == -1 {
                item.expire_time = i64::MAX;
            }
            // 所有开启中的邮件详情都需要存储
            detail_map.insert(item.id, item.clone());
            // 待发送列表 过滤掉已经过期的活动
            if now_sec < item.expire_time {
                items.push(item);
            }
        }

        // 时间分段数据 ((起始时间, 结束时间), Vec<活动数据>)
        let mail_to_send = Self::get_groups_active(&items);

        Ok(Self {
            detail_map,
            mail_to_send,
        })
    }

    pub fn get_current_data(&self, now_sec: &i64) -> Option<&SystemMailSegmentData> {
        let index = self.mail_to_send.binary_search_by(|segment| {
            if *now_sec < segment.time_start {
                std::cmp::Ordering::Greater
            } else if *now_sec >= segment.time_end {
                std::cmp::Ordering::Less
            } else {
                std::cmp::Ordering::Equal
            }
        });

        match index {
            Ok(index) => Some(&self.mail_to_send[index]),
            Err(_) => None,
        }
    }

    pub fn get_detail(&self, id: &i64) -> Option<&SystemMailItem> {
        self.detail_map.get(id)
    }

    pub fn get_can_send_list(&self, now_sec: &i64, max_id: &i64) -> Result<Vec<&SystemMailItem>> {
        let segment_data = self.get_current_data(now_sec);
        if segment_data.is_none() {
            return Ok(vec![]);
        }
        let segment_data = segment_data.unwrap();

        let mut mails_need_send = vec![];
        for mail in &segment_data.data {
            if mail.id > *max_id {
                mails_need_send.push(mail);
            }
        }

        Ok(mails_need_send)
    }
}
