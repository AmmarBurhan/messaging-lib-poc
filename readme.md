# **How to use this repo**
After cloning, run `npm install` then run `npm run build`
First we need to spin up the containers for RabbitMQ nodes.

    npm run docker:up

the above command will create a 3 nodes cluster
**

***rabbit-1: running on port 5672, Management port: 8081

rabbit-2: running on port 5673, Management port: 8082

rabbit-3: running on port 5674, Management port: 8083***

**
After that you can open the browser on `localhost:port_number` using any on the ports (`8081`, `8082`, `8083`) and wait till the cluster is formed. 
Next we need to enable tracing in all nodes

    npm run trace:on

Below steps shows how to run producers (or publishers) and and consumers on different nodes in order to see the capability of this package. Each file is named according to following conventions:
 - File names starting with p means it creates a producer and those starting with c means they create consumers.
 - File names end with `AtNodex` to inform where the client exactly is connected. *Even though we have cluster setup a client (publisher or consumer) must connect to a certain node*.

examples:

`pAtNode1.js` --> producer running on node 1

`cAtNode2.js` --> consumer running on node 2

## **Use cases**
producers run for 30 seconds, sends messages every five seconds and broadcast messages every 7 seconds.
*please terminate all the processes on every terminal before continuing to the next case*

**Producer on node 1 and consumer on node 2**

**Terminal 1**: run `node build/cAtNode2.js`

**Terminal 2**: run `node build/pAtNode1.js`

Observe consumer on node2 is handling and logging all messages coming from node1

**Producer on node 1, consumer first instance on node 2 and consumer second instance on node 3**
**Terminal 1**: run `node build/cAtNode2.js`

**Terminal 2**: run `node build/cAtNode3.js`

**Terminal 3**: run `node build/pAtNode1.js`

Observe consumer instances are handling and logging all messages coming from node1 on a round robin bases

 **Producer first instance node 1, second instance on node 2 and consumer is on node 3**

**Terminal 1**: run `node build/cAtNode3.js`

**Terminal 2**: run `node build/pAtNode1.js`

**Terminal 3**: run `node build/pAtNode2.js`

Observe how one consumer can consume from both producers

**Producer is on node 1, consumer is on node 2 and tracer  is on node 3**
**Terminal 1**: run `node build/cAtNode2.js`

**Terminal 2**: run `node build/messageTracerAtNode3.js`

**Terminal 3**: run `node build/pAtNode1.js`

Observe how the tracer logs every sent and received message in the cluster.

**Producer is on node 1, consumer is on node 2 and restarts on node 3**
**Terminal 1**: run `node build/cAtNode2.js`

**Terminal 2**: run `node build/pAtNode1.js`

terminate consumer in terminal 1 after it logs 3 messages
**Terminal 3**: run `node build/cAtNode3.js`

Observe how the consumer continues receiving the pending messages.

**Producer is on node 1, consumer is on node 2 and moves to another node on node restart**
**Terminal 1**: run `node build/cAtNode2.js`

**Terminal 2**: run `node build/pAtNode1.js`

restart rabbit-2 container in a. new terminal window
**Terminal 3**: run `docker restart rabbit-2`

Observe how the consumer continues receiving the pending messages. consumer 2 will log:

    connection closed!
    connecting to least busy node...
    connected to port: xxxx

**Producer is on node 1, consumer is on node 2 and producer moves to another node on node restart**
**Terminal 1**: run `node build/cAtNode2.js`

**Terminal 2**: run `node build/pAtNode1.js`

restart rabbit-1 container in a. new terminal window

**Terminal 3**: run `docker restart rabbit-1`

Observe how the producer switches to another node. consumer 2 will log:

    connection closed!
    connecting to least busy node...
    not connected // this may gets logged when the prodcuer tries to publish or broadcast something.
    // it is the responsibility of the prodcuer to retry sending if the connection is closed.
    // this happens only when the package serches for the next available running node
    connected to port: xxxx
