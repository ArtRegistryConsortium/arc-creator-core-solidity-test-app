Skip to content
Menu
On this page 
On this page
Sponsors
Become a Sponsor
# Template Refs ​
While Vue's declarative rendering model abstracts away most of the direct DOM operations for you, there may still be cases where we need direct access to the underlying DOM elements. To achieve this, we can use the special `ref` attribute:
template```
<input ref="input">
```

`ref` is a special attribute, similar to the `key` attribute discussed in the `v-for` chapter. It allows us to obtain a direct reference to a specific DOM element or child component instance after it's mounted. This may be useful when you want to, for example, programmatically focus an input on component mount, or initialize a 3rd party library on an element.
## Accessing the Refs ​
To obtain the reference with Composition API, we can use the `useTemplateRef()` helper:
vue```
<script setup>
import { useTemplateRef, onMounted } from 'vue'
// the first argument must match the ref value in the template
const input = useTemplateRef('my-input')
onMounted(() => {
 input.value.focus()
})
</script>
<template>
 <input ref="my-input" />
</template>
```

When using TypeScript, Vue's IDE support and `vue-tsc` will automatically infer the type of `input.value` based on what element or component the matching `ref` attribute is used on.
Usage before 3.5
In versions before 3.5 where `useTemplateRef()` was not introduced, we need to declare a ref with a name that matches the template ref attribute's value:
vue```
<script setup>
import { ref, onMounted } from 'vue'
// declare a ref to hold the element reference
// the name must match template ref value
const input = ref(null)
onMounted(() => {
 input.value.focus()
})
</script>
<template>
 <input ref="input" />
</template>
```

If not using `<script setup>`, make sure to also return the ref from `setup()`:
js```
export default {
 setup() {
  const input = ref(null)
  // ...
  return {
   input
  }
 }
}
```

The resulting ref is exposed on `this.$refs`:
vue```
<script>
export default {
 mounted() {
  this.$refs.input.focus()
 }
}
</script>
<template>
 <input ref="input" />
</template>
```

Note that you can only access the ref **after the component is mounted.** If you try to access `$refs.input``input` in a template expression, it will be `undefined``null` on the first render. This is because the element doesn't exist until after the first render!
If you are trying to watch the changes of a template ref, make sure to account for the case where the ref has `null` value:
js```
watchEffect(() => {
 if (input.value) {
  input.value.focus()
 } else {
  // not mounted yet, or the element was unmounted (e.g. by v-if)
 }
})
```

See also: Typing Template Refs
## Refs inside `v-for` ​
> Requires v3.5 or above
When `ref` is used inside `v-for`, the corresponding ref should contain an Array value, which will be populated with the elements after mount:
vue```
<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'
const list = ref([
 /* ... */
])
const itemRefs = useTemplateRef('items')
onMounted(() => console.log(itemRefs.value))
</script>
<template>
 <ul>
  <li v-for="item in list" ref="items">
   {{ item }}
  </li>
 </ul>
</template>
```

Try it in the Playground
Usage before 3.5
In versions before 3.5 where `useTemplateRef()` was not introduced, we need to declare a ref with a name that matches the template ref attribute's value. The ref should also contain an array value:
vue```
<script setup>
import { ref, onMounted } from 'vue'
const list = ref([
 /* ... */
])
const itemRefs = ref([])
onMounted(() => console.log(itemRefs.value))
</script>
<template>
 <ul>
  <li v-for="item in list" ref="itemRefs">
   {{ item }}
  </li>
 </ul>
</template>
```

When `ref` is used inside `v-for`, the resulting ref value will be an array containing the corresponding elements:
vue```
<script>
export default {
 data() {
  return {
   list: [
    /* ... */
   ]
  }
 },
 mounted() {
  console.log(this.$refs.items)
 }
}
</script>
<template>
 <ul>
  <li v-for="item in list" ref="items">
   {{ item }}
  </li>
 </ul>
</template>
```

Try it in the Playground
It should be noted that the ref array does **not** guarantee the same order as the source array.
## Function Refs ​
Instead of a string key, the `ref` attribute can also be bound to a function, which will be called on each component update and gives you full flexibility on where to store the element reference. The function receives the element reference as the first argument:
template```
<input :ref="(el) => { /* assign el to a property or ref */ }">
```

Note we are using a dynamic `:ref` binding so we can pass it a function instead of a ref name string. When the element is unmounted, the argument will be `null`. You can, of course, use a method instead of an inline function.
## Ref on Component ​
> This section assumes knowledge of Components. Feel free to skip it and come back later.
`ref` can also be used on a child component. In this case the reference will be that of a component instance:
vue```
<script setup>
import { useTemplateRef, onMounted } from 'vue'
import Child from './Child.vue'
const childRef = useTemplateRef('child')
onMounted(() => {
 // childRef.value will hold an instance of <Child />
})
</script>
<template>
 <Child ref="child" />
</template>
```

Usage before 3.5
vue```
<script setup>
import { ref, onMounted } from 'vue'
import Child from './Child.vue'
const child = ref(null)
onMounted(() => {
 // child.value will hold an instance of <Child />
})
</script>
<template>
 <Child ref="child" />
</template>
```

vue```
<script>
import Child from './Child.vue'
export default {
 components: {
  Child
 },
 mounted() {
  // this.$refs.child will hold an instance of <Child />
 }
}
</script>
<template>
 <Child ref="child" />
</template>
```

If the child component is using Options API or not using `<script setup>`, theThe referenced instance will be identical to the child component's `this`, which means the parent component will have full access to every property and method of the child component. This makes it easy to create tightly coupled implementation details between the parent and the child, so component refs should be only used when absolutely needed - in most cases, you should try to implement parent / child interactions using the standard props and emit interfaces first.
An exception here is that components using `<script setup>` are **private by default** : a parent component referencing a child component using `<script setup>` won't be able to access anything unless the child component chooses to expose a public interface using the `defineExpose` macro:
vue```
<script setup>
import { ref } from 'vue'
const a = 1
const b = ref(2)
// Compiler macros, such as defineExpose, don't need to be imported
defineExpose({
 a,
 b
})
</script>
```

When a parent gets an instance of this component via template refs, the retrieved instance will be of the shape `{ a: number, b: number }` (refs are automatically unwrapped just like on normal instances).
Note that defineExpose must be called before any await operation. Otherwise, properties and methods exposed after the await operation will not be accessible.
See also: Typing Component Template Refs
The `expose` option can be used to limit the access to a child instance:
js```
export default {
 expose: ['publicData', 'publicMethod'],
 data() {
  return {
   publicData: 'foo',
   privateData: 'bar'
  }
 },
 methods: {
  publicMethod() {
   /* ... */
  },
  privateMethod() {
   /* ... */
  }
 }
}
```

In the above example, a parent referencing this component via template ref will only be able to access `publicData` and `publicMethod`.
Edit this page on GitHub
Template Refs has loaded
![](https://cdn.usefathom.com/?h=https%3A%2F%2Fvuejs.org&p=%2Fguide%2Fessentials%2Ftemplate-refs&r=&sid=XNOLWPLB&qs=%7B%7D&cid=2559454)
