.PHONY : all help client server server-pm stop-server-pm list-server-pm stop-all-pm delete-all-pm logs-server-pm flush-logs-server-pm

port ?= 3000

all:
	echo "Hello, nothing to do by default"
	echo "Try 'make help'"

# target: help - Display callable targets.
help:
	egrep "^# target:" [Mm]akefile

# target: client - Starts a socket client that aims at the server port of your choosing. Monitored by nodemon.
client:
	yarn client -- --server-port $(port)

# target: server - Starts a development server at the port of your choosing. Monitored by nodemon.
server:
	yarn server -- serve $(port)

# target: docs-pm - Starts a pm2 managed server process at the port of your choosing.
server-pm:
	./node_modules/.bin/pm2 start src/server.js --name="server_$(port)" -- serve $(port)

# target: kill-pm - Kills a process managed by pm2
stop-server-pm:
	./node_modules/.bin/pm2 stop $(server)

# target: list-server-pm - Lists all servers managed by pm2
list-server-pm:
	./node_modules/.bin/pm2 list

# target: stop-all-pm - Kills all processes managed by pm2
stop-all-pm:
	./node_modules/.bin/pm2 stop all

# target: restart-all-pm - Kills all processes managed by pm2
restart-all-pm:
	./node_modules/.bin/pm2 restart all

# target: delete-all-pm - Kills all processes managed by pm2
delete-all-pm:
	./node_modules/.bin/pm2 delete all

# target: logs-server-pm - Output logs from pm servers
logs-server-pm:
	./node_modules/.bin/pm2 logs

# target: flush-logs-server-pm - Flsu logs from pm servers
flush-logs-server-pm:
	./node_modules/.bin/pm2 flush
