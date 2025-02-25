v4.0
`⌘K``Ctrl K`DocsComponentsBlogShowcase
  1. Typography
  2. font-family


Typography
# font-family
Utilities for controlling the font family of an element.
Class| Styles  
---|---  
`font-sans`| `font-family: var(--font-sans); /* ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji' */`  
`font-serif`| `font-family: var(--font-serif); /* ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif */`  
`font-mono`| `font-family: var(--font-mono); /* ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace */`  
`font-(family-name:<custom-property>)`| `font-family: var(<custom-property>);`  
`font-[<value>]`| `font-family: <value>;`  
## Examples
### Basic example
Use utilities like `font-sans` and `font-mono` to set the font family of an element:
font-sans
The quick brown fox jumps over the lazy dog.
font-serif
The quick brown fox jumps over the lazy dog.
font-mono
The quick brown fox jumps over the lazy dog.
```
<p class="font-sans ...">The quick brown fox ...</p><p class="font-serif ...">The quick brown fox ...</p><p class="font-mono ...">The quick brown fox ...</p>
```

### Using a custom value
Use the `font-[<value>]` syntax to set the font family based on a completely custom value:
```
<p class="font-[Open_Sans] ..."> <!-- ... --></p>
```

For CSS variables, you can also use the `font-(family-name:<custom-property>)` syntax:
```
<p class="font-(family-name:--my-font) ..."> <!-- ... --></p>
```

This is just a shorthand for `font-[family-name:var(<custom-property>)]` that adds the `var()` function for you automatically.
### Responsive design
Prefix a `font-family` utility with a breakpoint variant like `md:` to only apply the utility at medium screen sizes and above:
```
<p class="font-sans md:font-serif ..."> <!-- ... --></p>
```

Learn more about using variants in the variants documentation.
## Customizing your theme
Use the `--font-*` theme variables to customize the font family utilities in your project:
```
@theme { --font-display: "Oswald", "sans-serif"; }
```

Now the `font-display` utility can be used in your markup:
```
<div class="font-display"> <!-- ... --></div>
```

You can also provide default `font-feature-settings` and `font-variation-settings` values for a font family:
```
@theme { --font-display: "Oswald", "sans-serif"; --font-display--font-feature-settings: "cv02", "cv03", "cv04", "cv11";  --font-display--font-variation-settings: "opsz" 32; }
```

If needed, use the @font-face at-rule to load custom fonts:
```
@font-face { font-family: Oswald; font-style: normal; font-weight: 200 700; font-display: swap; src: url("/fonts/Oswald.woff2") format("woff2");}
```

If you're loading a font from a service like Google Fonts, make sure to put the `@import` at the very top of your CSS file:
```
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");@import "tailwindcss";@theme { --font-roboto: "Roboto", sans-serif; }
```

Browsers require that `@import` statements come before any other rules, so URL imports need to be above imports like `@import "tailwindcss"` which are inlined in the compiled CSS.
Learn more about customizing your theme in the theme documentation.
### On this page
  * Quick reference
  * Examples
    * Basic example
    * Using a custom value
    * Responsive design
  * Customizing your theme


![Refactoring UI](https://tailwindcss.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbook-promo.27d91093.png&w=256&q=75)
From the creators of Tailwind CSS
Make your ideas look awesome, without relying on a designer.
> “This is the survival kit I wish I had when I started building apps.”
> Derrick Reimer, SavvyCal
Copyright © 2025 Tailwind Labs Inc.·Trademark Policy
![](https://cdn.usefathom.com/?h=https%3A%2F%2Ftailwindcss.com&p=%2Fdocs%2Ffont-family&r=&sid=PMFMDJGK&qs=%7B%7D&cid=55156788)
