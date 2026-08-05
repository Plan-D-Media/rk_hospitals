# partials/ — reference copies only

**Nothing in this folder is built, fetched, imported or included at runtime.**
The site is plain static HTML with no build step, and these blocks are inlined
verbatim into each of the 39 pages.

This folder exists so there is **one source of truth to copy from** when a shared
block changes. Editing a file here changes nothing on its own — you must
propagate the change into every page.

| File | Inlined into | Where in the page |
|---|---|---|
| `icon-sprite.html` | every page | immediately after `<body>` |
| `header.html` | every page except `landing.html` | after the sprite |
| `footer.html` | every page except `landing.html` | before the closing scripts |

`landing.html` is deliberately excluded from the header and footer: it is a
paid-traffic landing page (`noindex, follow`, `Disallow: /landing` in
robots.txt) with an intentionally stripped `.lp-bar` nav, so that an ad click
lands on the form rather than on a full site navigation.

## Propagating a change

Edit the file here, then re-run the propagation script from the scratchpad. It
is deliberately **not** committed — it is a one-shot migration tool, not part of
the build:

```
python <scratchpad>/propagate_partials.py --apply
```

Then verify: no page should differ from the reference except for the single
`class="active"` marker on the current nav item.
