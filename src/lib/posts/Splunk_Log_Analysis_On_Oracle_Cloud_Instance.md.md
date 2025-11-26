---
title: "Splunk Log Analysis On Oracle Cloud Instance"
date: "2025-11-25"
updated: "2025-11-25"
categories:
  - "cloud"
  - "oracle"
  - "lab"
  - "beginner"
coverImage: "/blogImages/blog1/Oracle-Cloud-Logo.png"
coverWidth: 8
coverHeight: 4
excerpt: November 25, 2025
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

*"You realize that you can just do things right? Like you can just do them. Just do things"* 

Me:
![ok](/static/blogImages/blog1/saitama_ok.jpg)

Since I don't know anything about Oracle and Splunk. let's learn and create a project around them. Let's do it. 

### Introduction
While my [personal homelab](https://github.com/hiCozyty/homelab) is still a work in progress, I'm not confident in its network security setup to host a vulnerable machine in my (even DMZ isolated) VLAN. I just don't feel comfortable.

So we turn to either AWS or Oracle Cloud who offer free plans. Since I'm already using AWS, Oracle it is. I know Azure also offer a generous plan, but I'm saving that for Windows stuff later down the road.  

For capturing potential sniffing or attacks, Oracle Cloud Infrastructure (OCI) provides an [in-house solution](https://blogs.oracle.com/observability/la-demystifying-agent-om-oci) called `OCI Observability and Management`, in which monitoring agents are deployed and the logs are automatically captured in their OCI log storage. 

When considering the data ingestion limit of splunk free tier at 500MB/day and OCI log storage limit of 10GB/month, OCI log storage is the bottleneck here. 

To maximize the theoretical log output for analysis, I will be opting out of the OCI ecosystem and handle the log storage on my own. 

<Callout>
Oracle Cloud offers two 1 CPU / 1GB RAM x86 based instances for free. 

There is an arm based instance in which you can opt for 4 CPU and 24GB RAM. And you can run a single arm instance under the free tier.

For issues with provisioning the arm based instance due to saturation, go to billing and upgrade to the `Pay as you go` model to bypass the API limits. 

This instance can remain free afterwards.
</Callout>

## Objectives
The endgoal for me is to produce a minimum working lab with secure logging attached where I can add more features to the log producing machine in the future based on my needs.

The logs should undergo automatic pruning during rsyslog. 

When considering Splunk free tier's daily data ingestion limit, I would need to implement some sort of network rate limiter or debouncer in the log producing machine.


## Planned Topology
![topology](/static/blogImages/blog1/oracle_lab.jpg)
*created with draw.io*
## Technologies Being leveraged

* Oracle Cloud Instances (running AlmaLinux for both)
* Splunk / Splunk universal forwarder
* rsyslog
* tailscale ACL

## Tailscale
For this project, I'm using my throwaway account.
![acl](/static/blogImages/blog1/acl.png)
For quick sanity check, I uncommented the second line in the ACL and spun up a python http server then tried to `wget` from the jumpserver. `wget` was working when the second ACL line was uncommented, and not working when commented out. Perfect.
```
python3 -m http.server 8000
```

## Oracle Cloud Initial Configuration
Let's first do some updates and run an auto updater so I can set it and forget it.


Default Username `opc` has sudo privilges by default. Let's follow principle of least privilege and create new user account.
```
sudo adduser admin
sudo mkdir -p /home/admin/.ssh
sudo cp ~/.ssh/authorized_keys /home/admin/.ssh/
sudo chown -R admin:admin /home/admin/.ssh
sudo chmod 700 /home/admin/.ssh
sudo chmod 600 /home/admin/.ssh/authorized_keys
```

## Jumpserver Firewall config


## Resources
https://tailscale.com/kb/1149/cloud-oracle