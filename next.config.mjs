/** @type {import('next').NextConfig} */
const nextConfig = {
    // webpack:(config) => {
    //     config.reslove.alias.canvas = false;
    //     return config;
    // },
    images:{
        remotePatterns:[
            {
                protocol:'https',
                hostname: "www.awesomescreenshot.com",
                
            },
            {
                protocol:"https",
                hostname:"img.clerk.com"
            }
        ]
    }
};

export default nextConfig;
