Ad Hoc Checks with Sensu
========================

We've been using [Sensu](https://sensuapp.org/) for system monitoring.  
After looking at Nagios and Zabbix, I found Sensu to be refreshingly simple and clean.  
There's a server that publishes check requests to clients and reports on their responses.
All communication is done over RabbitMQ except for some history that is stored in Redis.

Normally to create a check, you add some json to a config file on the server.  For example, 

    "check-docker_service": {
      "command": "/sbin/service docker status",
      "interval": 60,
      "subscribers": [ "docker" ],
      "handlers": ["default", "pagerduty"],
      "pager_team": "warning"
    },

would make sure docker is running on all hosts subscribed to 'docker'.  If any host responded
with an error, it would be shown in the [Uchiwa UI](https://github.com/sensu/uchiwa) and 
we'd get pinged by PagerDuty.

This configuration serves as a specification of our infrastructure, partially describing what 
the hosts should be doing at any given time.  Sometimes, though, you just want to get an alert
when something goes wrong, say while developing a new tool, and you don't want to go through the 
effort to add a new check definition and bounce the Sensu server.  It turns out this is easy to do.

Each sensu client listens on a tcp port (default 3030).  Writing a json blob to that port will
fire a check response even if there is no corresponding definition on the server side.  For
example

    $ echo '{"name": "ad-hoc-check", "output": "arbitrary", "status": 2}' | nc 127.0.01 3031

from a host running a sensu client will post an error to the server, and will immediately be displayed
in the UI.  (Like Nagios, a status of 0 corresponds to "ok", 1 to "warning", 2 to "error", and 3 to "unknown".)  
To resolve the error, you can change the status:  

    $ echo '{"name": "ad-hoc-check", "output": "arbitrary", "status": 0}' | nc 127.0.01 3031

We wanted to do this from some machines not fully in our control, so we started a sensu client
in Marathon in a Docker container.  It's important that the client accept requests from anywhere, which
can be specified in the client config.

  "client": {
    "name": "marathon-sensu-client",
    "address": "marathon-sensu-client",
    "subscriptions": [ "all" ],
    "socket": {
      "bind": "0.0.0.0",
      "port": 3031
    }
  }

With some DNS and HAProxy magic, now anything that can route to our Mesos cluster can publish errors to Sensu
at sensu-client.example.com:3031.

While this may seem a rather undiciplined way to do monitoring, it has significantly lowered the 
barrier to getting alerts into our monitoring infrastructure.  Moreover, once a check becomes obviously 
important, it's easy enough to formalize it in the json glob on the server.  

Thanks to the Sensu team for their very nice piece of infrastructure!
