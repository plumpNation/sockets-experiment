Horizontal scaling a socket application
=======================================

I'm trying to figure out the cleanest and easiest way to provide redundancy on a socket
application.

Things to achieve:
- Servers should be able to go down and come up with ease.
 - Any server in the cluster should be able to handle your request should one go down.
- Sockets should be versioned?
- Every part of the application should have redundancy.
- Clients should be able to lose connections and be picked up again when they come back online.
 - Clients should be able to change connection type (wi-fi, mobile).
- Complete

## Ideas
Share the connection information with all the servers, but each server should not need to know
any information until it needs it.
