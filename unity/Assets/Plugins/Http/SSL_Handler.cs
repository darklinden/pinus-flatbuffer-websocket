using System;
using System.Threading;

using UnityEngine.Networking;

namespace Http
{
    public class SSL_Handler : CertificateHandler
    {
        // Based on https://www.owasp.org/index.php/Certificate_and_Public_Key_Pinning#.Net
        // AcceptAllCertificatesSignedWithASpecificPublicKey
        // Encoded RSAPublicKey
        // private static string PUB_KEY = "somepublickey";

        protected override bool ValidateCertificate(byte[] certificateData)
        {
            // X509Certificate2 certificate = new X509Certificate2(certificateData);
            // string pk = certificate.GetPublicKeyString();
            // Debug.Log(pk.ToLower());
            // return pk.Equals(PUB_KEY);

            return true;
        }

        // private static SSL_Handler s_Default = null;
        public static SSL_Handler Default
        {
            get
            {
                return new SSL_Handler();
            }
        }
    }
}