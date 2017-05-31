export const config = {
    "apps": [{
        "root": "src",
        "prefix": "app"
    }],
    "defaults": {
        "styleExt": "css",
        "prefixInterfaces": false,
        "inline": {
            "style": false,
            "template": false
        },
        "spec": {
            "class": false,
            "component": true,
            "directive": false,
            "module": false,
            "pipe": true,
            "service": false
        }
    }
}