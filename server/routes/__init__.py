"""HTTP routes, one module per feature (explain / quiz / chat).

Routers stay thin: validate input, call a prompt builder + a service, return a
typed response. No prompt strings and no SDK calls live here.
"""
