<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div id="module1"></div>
  </div>
</template>
<script>
export default {
  mounted() {
    System.import('@vue2/module1').then((v) => {
      v('#module1')
    })
  }
}
</script>
