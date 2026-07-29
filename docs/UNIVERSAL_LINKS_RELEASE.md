# HTTPS app-link release prerequisites

The Expo app declares both `https://www.globalsponsorhub.com/*` and
`https://globalsponsorhub.com/*`. Production verification also requires these
unsigned JSON files to be served with `Content-Type: application/json`, no
redirect, and a 200 response:

- `https://www.globalsponsorhub.com/.well-known/assetlinks.json`
- `https://globalsponsorhub.com/.well-known/assetlinks.json`
- `https://www.globalsponsorhub.com/.well-known/apple-app-site-association`
- `https://globalsponsorhub.com/.well-known/apple-app-site-association`

Do not publish placeholder values. Add the following files to
`global_sponsor_hub-fe/public/.well-known/` once release credentials are known.

## Android `assetlinks.json`

Use package `global.sponsor.hub` and the SHA-256 fingerprint(s) from the actual
Play App Signing certificate (include separate fingerprints for any supported
non-Play release certificate):

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "global.sponsor.hub",
    "sha256_cert_fingerprints": ["PLAY_APP_SIGNING_SHA256"]
  }
}]
```

## iOS `apple-app-site-association`

Replace `APPLE_TEAM_ID` with the App Store distribution team ID. The bundle ID
is `com.globalsponsorhub.candidate`.

```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "APPLE_TEAM_ID.com.globalsponsorhub.candidate",
      "components": [{ "/": "/*", "comment": "Public GSH routes use the in-app parity resolver" }]
    }]
  }
}
```

After deployment, verify both hosts with Android Digital Asset Links and on a
physical iOS device. A new native build is required after changing associated
domains or Android intent filters.
