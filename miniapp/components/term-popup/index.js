/* 术语弹层
 *
 * 富文本走 rich-text 的 HTML String 模式：抽取器已把 class='hl' 换成内联 style
 * （rich-text 不认 class），所以这里直接喂 nodes 即可，highight 不会丢。
 */

Component({
  options: { addGlobalClass: true },

  properties: {
    show: Boolean,
    term: { type: Object, value: null },
    sciName: { type: String, value: '' },
    related: { type: Array, value: [] },
  },

  methods: {
    close() {
      this.triggerEvent('close');
    },
    onRelated(e) {
      this.triggerEvent('related', { key: e.currentTarget.dataset.k });
    },
    noop() {},
  },
});
