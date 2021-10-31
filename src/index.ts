import "kity"
import "../kityminderCore/kityminder"

console.log("kityminder-core 加载成功了")

window.onload = evt => {
  // @ts-ignore
  new window.kityminder.Minder({
    renderTo: "body",
  })
}
