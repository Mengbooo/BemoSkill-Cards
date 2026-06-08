# Platform Specs

Use these defaults unless the user requests another size.

| Platform | Size | Selector | Notes |
| --- | ---: | --- | --- |
| Xiaohongshu / Rednote | `1080x1440` | `.card` | Portrait 3:4 carousel cards. |
| WeChat official account cover | `900x383` | `.cover-card.wechat` | Standalone cover. Do not show page numbers. |
| X / Twitter header | `1500x500` | `.cover-card.twitter` | Keep important text away from the far edges. |

Output folders:

```text
output/xhs-dark/
output/xhs-light/
output/platform-covers/dark/wechat/
output/platform-covers/dark/twitter/
output/platform-covers/light/wechat/
output/platform-covers/light/twitter/
```

Use `dark` and `light` in filenames/folders rather than inspiration-brand names.
