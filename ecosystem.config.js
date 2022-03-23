module.exports = {
	apps : [
		{
			name: "ioserver",
			script: "index.js",
			error_file: './logs/err_app3011.log',
			out_file: './logs/out_app3011.log',
			log_file: './logs/combined_app3011.log',
			time: true,
			env: {
				PORT: 3011,
				NODE_ENV: "development",
			},
			env_production: {
				PORT: 3011,
				NODE_ENV: "production",
			}
		},
	]
}