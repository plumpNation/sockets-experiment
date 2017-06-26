Horizontal scaling a socket application
=======================================

## TLDR

```shell
# Install redis server
sudo apt-get update
sudo apt-get install redis-server

# Start some servers
make server port=3000
make server port=3001

# Run some clients
yarn client # defaults to port 3000
yarn client -- --server-port 3001
```

If you want the servers to be process managed, use `make server-pm port=3000`.

Redis host and port can be set in the config directory in a `local.json` file.

## NOTES

I'm trying to figure out the cleanest and easiest way to provide redundancy on a socket
application.

Things to achieve:
- Servers should be able to go down and come up with ease.
 - Any server in the cluster should be able to handle your request should one go down.
- Sockets should be versioned?
- Every part of the application should have redundancy.
- Clients connecting to different servers should be able to join the same room and talk to each other.
- Clients should be able to lose connections and be picked up again when they come back online.
 - Clients should be able to change connection type (wi-fi, mobile).
- Complete
