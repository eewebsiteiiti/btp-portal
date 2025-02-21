// ecosystem.config.js
module.exports = {
    apps : [{
      name: "next-app",
      script: "npm",
      args: "start",
      cwd: "/home/eebtpwebsite/htdocs/eebtp.profiles.iiti.ac.in",
      watch: true,
      env: {
        NEXTAUTH_SECRET: "my-secret",
        NEXTAUTH_URL:"https://eebtp.profiles.iiti.ac.in/",
        DATABASE_URL:"mongodb://0.0.0.0:27017/btpportaldb",
        ADMIN_EMAIL:"rupal@r.com",
        ADMIN_PASSWORD:"abc"
      }
    }]
  };
  