/*-----------------------------------------------------------------------------------*/
/* Utils
/*-----------------------------------------------------------------------------------*/
const select = (e) => document.querySelector(e);
const selectAll = (e) => document.querySelectorAll(e);

/*-----------------------------------------------------------------------------------*/
/*  State
/*-----------------------------------------------------------------------------------*/
const state = {};
window.state = state;

/*-----------------------------------------------------------------------------------*/
/* Gallery
/*-----------------------------------------------------------------------------------*/
// ###### Model ######
class Gallery {
  constructor() {
    this.limit = 5;
    this.currentPage = 1;
    this.blur = 0;
    this.grayscale = false;
  }

  async getItems() {
    try {
      const res = await fetch(
        `https://picsum.photos/v2/list?page=${this.currentPage}&limit=${this.limit}`,
        {
          method: 'GET',
        }
      );
      this.items = await res.json();
    } catch (error) {
      console.log(error);
    }
  }

  getItem(id) {
    this.item = this.items.find((item) => item.id === id);

    this.item = {
      ...this.item,
      download_url: `${this.item.download_url}?${
        this.grayscale ? 'grayscale' : ''
      }${this.blur > 0 ? '&blur=' + this.blur : ''}`,
    };
  }

  setGrayscale() {
    this.grayscale = !this.grayscale;
  }

  setBlur(blur) {
    this.blur = blur;
  }

  incrementCurrPage() {
    this.currentPage++;
  }

  decrementCurrPage() {
    this.currentPage > 1 && this.currentPage--;
  }
}

// ###### Controller ######
const initGallery = async () => {
  // Add gallery to the global state if not already added
  if (!state.gallery) state.gallery = new Gallery();

  // Get items
  await state.gallery.getItems();

  // Render items on UI
  renderGalleryItems(state.gallery.items);
};

const initGalleryPicture = (e) => {
  // Get id of the selected picture
  const id = e.target.closest('.gallery__menu-picture').dataset.id;

  // Get item
  state.gallery.getItem(id);

  // Render item on UI
  renderGalleryPicture(state.gallery.item);

  // Render item details on UI
  renderGalleryPictureDetails(state.gallery.item);
};

const changePage = async (type) => {
  // Increment or decrement the page number
  if (type === 'increment') {
    state.gallery.incrementCurrPage();
  } else {
    state.gallery.decrementCurrPage();
  }

  // Get items
  await state.gallery.getItems();

  // Remove old items from UI
  clearGalleryItems();

  // Render new items on UI
  renderGalleryItems(state.gallery.items);
};

const toggleGrayscale = () => {
  // Set grayscale
  state.gallery.setGrayscale();

  // Get item
  state.gallery.getItem(state.gallery.item.id);

  // Render item on UI
  renderGalleryPicture(state.gallery.item);

  // Render item details on UI
  renderGalleryPictureDetails(state.gallery.item);
};

const setBlur = (e) => {
  // Get input value
  const inputValue = e.target.value;

  // Set blur
  state.gallery.setBlur(inputValue);

  // Get item
  state.gallery.getItem(state.gallery.item.id);

  // Render item on UI
  renderGalleryPicture(state.gallery.item);

  // Render item details on UI
  renderGalleryPictureDetails(state.gallery.item);
};

// ###### View ######
const renderGalleryItems = (items) => {
  items.map((item) => {
    const markup = `
      <li class="gallery__menu-item">
        <img class="gallery__menu-picture" src="${item.download_url}" alt="picture thumbnail" data-id="${item.id}" />
      </li>
    `;

    select('.gallery__menu-items').insertAdjacentHTML('beforeend', markup);
  });
};

const clearGalleryItems = () => {
  select('.gallery__menu-items').innerHTML = '';
};

const renderGalleryPicture = (img) => {
  const markup = `
    <img src="${img.download_url}" alt="enlarged picture" />
  `;

  select('.gallery__picture').innerHTML = markup;
};

const renderGalleryPictureDetails = (img) => {
  const markup = `
    <h3 class='gallery__info-headline'>Details</h3>
    <p class='gallery__author'>Author: ${img.author}</p>
    <p class='gallery__dimensions'>Dimensions: ${img.width}x${img.height}px</p>
  `;

  select('.gallery__picture-details').innerHTML = markup;
};

/*-----------------------------------------------------------------------------------*/
/* Events
/*-----------------------------------------------------------------------------------*/
window.addEventListener('load', initGallery);

select('.gallery__pagination-arrow--left').addEventListener('click', () =>
  changePage('decrement')
);

select('.gallery__pagination-arrow--right').addEventListener('click', () =>
  changePage('increment')
);

select('.gallery__menu-items').addEventListener('click', initGalleryPicture);

select('.gallery__slider-input').addEventListener('click', setBlur);

select('.gallery__switch').addEventListener('click', toggleGrayscale);
