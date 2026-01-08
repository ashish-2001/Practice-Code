import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from "react-icons/fa";

const FooterLink = [
    {
        title: 'Policy', 
        links: [
            {
                title: 'Shipping & Delivery Policy',
                link: '/shipping-delivery-policy',
            },
            {
                title: 'Return & Exchange Policy',
                link: '/Return-exchange-policy'
            },
            {
                title: 'Payment Policy',
                link: '/Payment-policy'
            },
            {
                title: 'Grievance redressal policy',
                path: '/grievance-redressal-policy'
            }
        ]
    },
    {
        title: 'Help',
        link: [
            {
                title: 'FAQs',
                link: '/faqs'
            },
            {
                title: 'Contact Us',
                link: '/contact-us'
            },
            {
                title: 'Terms of service',
                link: '/terms-service'
            },
            {
                title: 'Privacy Policy',
                link: '/privacy-policy'
            },
            {
                title: 'Track order',
                link: '/track-order'
            },
            {
                title: 'Exchange & Return',
                link: '/return-exchange-policy'
            }
        ]
    },
    {
        title: 'About Us',
        link: [
            {
                title: 'About Us',
                link: '/about-us'
            },
            {
                title: 'Blogs',
                link: '/blogs'
            },
            {
                title: 'Contact Us',
                link: '/contact-us'
            }
        ]
    }
];

const SocialMediaLinks = [
    {
        logo: `<FaTwitter/>`,
        link: 'https://twitter.com'
    },
    {
        logo: `<FaFacebook/>`,
        link: 'https://facebook.com'
    },
    {
        logo: `<FaYoutube/>`,
        link: 'https://youtube.com'
    },
    {
        logo: `<FaGoogle/>`,
        link: 'https://google.com'
    }
]

export {
    FooterLink,
    SocialMediaLinks
}