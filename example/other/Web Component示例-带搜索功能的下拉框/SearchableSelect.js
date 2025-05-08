/*
 * @Description: 带搜索功能的下拉框web component
 * @Author: travelclover(travelclover@163.com)
 * @Date: 2025-05-08 16:31:46
 */
// 定义可搜索下拉框组件
class SearchableSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    this.selectedOption = null;
    this.options = [];
    this.filteredOptions = [];
    this.render();
  }

  static get observedAttributes() {
    return ['placeholder'];
  }

  get value() {
    return this.selectedOption ? this.selectedOption.value : null;
  }

  set value(value) {
    const option = this.options.find((opt) => opt.value === value);
    if (option) {
      this.selectOption(option.value, option.text);
    } else {
      this.selectOption(value, value);
    }
  }

  // 在属性更改、添加、移除或替换时调用
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placeholder' && this.shadowRoot) {
      const input = this.shadowRoot.querySelector('.search-input');
      if (input) {
        input.placeholder = newValue;
      }
    }
  }

  // 每当元素添加到文档中时调用。规范建议开发人员尽可能在此回调中实现自定义元素的设定，而不是在构造函数中实现。
  connectedCallback() {
    this.updateOptions();
    this.setupEventListeners();
  }

  updateOptions() {
    // 获取所有选项
    const optionElements = this.querySelectorAll('option');
    this.options = Array.from(optionElements).map((option) => ({
      value: option.getAttribute('value'),
      text: option.textContent,
    }));

    // 更新时候，判断是否存在选中项
    if (
      this.selectedOption &&
      this.selectedOption.value &&
      this.options.length > 0
    ) {
      const optionTarget = this.options.find(
        (option) => option.value === this.selectedOption.value
      );
      if (optionTarget) {
        this.selectedOption = optionTarget;
        this.updateSearchInput(this.selectedOption.text);
      }
    }
    this.filteredOptions = [...this.options];
    this.updateDropdown();
  }

  setupEventListeners() {
    // 获取元素
    const selectContainer = this.shadowRoot.querySelector('.select-container');
    const searchInput = this.shadowRoot.querySelector('.search-input');
    const dropdown = this.shadowRoot.querySelector('.dropdown');
    const toggleButton = this.shadowRoot.querySelector('.toggle-button');

    // 点击输入框或按钮时切换下拉框
    selectContainer.addEventListener('click', (e) => {
      if (e.target === toggleButton || e.target === searchInput) {
        this.toggleDropdown();
      }
    });

    // 输入搜索内容时过滤选项
    searchInput.addEventListener('input', () => {
      this.filterOptions(searchInput.value);
    });

    // 点击下拉选项时选择
    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item'); // 向上查找匹配特定选择器的最近的祖先元素（包括当前元素自身）
      if (item) {
        const value = item.dataset.value;
        const text = item.textContent;
        this.selectOption(value, text);
      }
    });

    // 点击外部时关闭下拉框
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && this.isOpen) {
        this.closeDropdown();
      }
    });

    // 监听子元素变化
    const observer = new MutationObserver(() => {
      this.updateOptions();
    });
    observer.observe(this, {
      childList: true, // 监听直接子节点的添加或删除
      subtree: true, // 监听所有后代节点的变化，不仅仅是直接子节点
    });
  }

  render() {
    const placeholder = this.getAttribute('placeholder') || '请选择';

    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
        font-family: Arial, sans-serif;
        position: relative;
        height: 32px;
      }
      .select-container {
        position: relative;
        height: 100%;
        width: 100%;
        border: 1px solid #ccc;
        box-sizing: border-box;
        display: flex;
        align-items: center;
      }
      .search-input {
        flex: 1;
        border: none;
        font-size: 14px;
        outline: none;
        background: transparent;
        width: 100%;
        box-sizing: border-box;
      }
      .toggle-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 10px;
        font-size: 16px;
        color: #666;
        transition: transform 0.2s;
      }
      .toggle-button.open {
        transform: rotate(180deg);
      }
      .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        max-height: 200px;
        overflow-y: auto;
        background: white;
        border: 1px solid #ccc;
        border-top: none;
        border-radius: 0 0 4px 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        z-index: 100;
        display: none;
        box-sizing: border-box;
      }
      .dropdown.open {
        display: block;
      }
      .dropdown-item {
        padding: 10px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .dropdown-item:hover {
        background-color: #f5f5f5;
      }
      .dropdown-item.selected {
        background-color: #e6f7ff;
        font-weight: bold;
      }
      .no-results {
        padding: 10px;
        color: #999;
        text-align: center;
        font-style: italic;
      }
      .select-container:focus-within {
        border-color: #4d90fe;
        box-shadow: 0 0 0 2px rgba(77, 144, 254, 0.2);
      }
    </style>
    <div class="select-container">
      <input type="text" class="search-input" placeholder="${placeholder}">
      <button class="toggle-button">▼</button>
    </div>
    <div class="dropdown"></div>
  `;
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    const dropdown = this.shadowRoot.querySelector('.dropdown');
    const toggleButton = this.shadowRoot.querySelector('.toggle-button');
    dropdown.classList.add('open');
    toggleButton.classList.add('open');
    this.isOpen = true;
  }

  closeDropdown() {
    const dropdown = this.shadowRoot.querySelector('.dropdown');
    const toggleButton = this.shadowRoot.querySelector('.toggle-button');
    dropdown.classList.remove('open');
    toggleButton.classList.remove('open');
    this.isOpen = false;

    // 判断是否有选中项，没有则清空
    const searchText = this.selectedOption
      ? this.selectedOption.text || ''
      : '';
    this.updateSearchInput(searchText);
    this.filterOptions(searchText);
  }

  filterOptions(query) {
    query = query.toLowerCase();
    this.filteredOptions = this.options.filter((option) =>
      option.text.toLowerCase().includes(query)
    );
    this.updateDropdown();
  }

  updateDropdown() {
    const dropdown = this.shadowRoot.querySelector('.dropdown');
    dropdown.innerHTML = '';

    if (this.filteredOptions.length === 0) {
      dropdown.innerHTML = '<div class="no-results">无匹配结果</div>';
      return;
    }

    this.filteredOptions.forEach((option) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      if (this.selectedOption && this.selectedOption.value === option.value) {
        item.classList.add('selected');
      }
      item.textContent = option.text;
      item.dataset.value = option.value;
      dropdown.appendChild(item);
    });
  }

  selectOption(value, text) {
    this.selectedOption = { value, text };
    this.updateSearchInput(text);
    this.closeDropdown();

    // 触发 change 事件
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value, text },
        bubbles: true, // 设置事件冒泡属性为 true，事件会从触发元素向上冒泡到 DOM 树的祖先元素，使外部代码可以在组件的父元素上监听这个事件
      })
    );
    this.updateDropdown();
  }

  updateSearchInput(text) {
    const searchInput = this.shadowRoot.querySelector('.search-input');
    searchInput.value = text;
  }

  getText() {
    return this.selectedOption ? this.selectedOption.text : null;
  }

  reset() {
    this.selectedOption = null;
    const searchInput = this.shadowRoot.querySelector('.search-input');
    searchInput.value = '';
    this.filteredOptions = [...this.options];
    this.updateDropdown();
  }
}
