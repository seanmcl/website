Sensu alerts in Slack
=====================

The default Slack handler for Sensu is pretty good.  One thing we wanted 
was to have a link to the Uchiwa UI so it was easier to see the check
output on failure.  I started by forking [sensu-plugins-slack](https://github.com/sensu-plugins/sensu-plugins-slack)
to add the requisite fields to the json glob in the slack handler configuration.
While reading the code, I found support for [ruby templates](http://www.stuartellis.eu/articles/erb/).
Just adding this little file set up our uchiwa frontend.

    <%=
      [@event["check"]["output"],
       @event["client"]["address"],
       @event["client"]["subscriptions"].join(","),
       "<http://sensu.eglp.com/#/client/Core/#{@event["client"]["name"]}?check=#{@event["check"]["name"]}|Uchiwa>"
       ].join(" : ")
    %>

The server config is similarly simple

    "slack": {
      "webhook_url": "https://hooks.slack.com/services/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",
      "username": "sensu",
      "channel": "#sensu",
      "template": "/etc/sensu/conf.d/slack-template.erb",
      "timeout": 10
    }
    
