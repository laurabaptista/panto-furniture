// drawer menu hamburguer
const hamburger = document.querySelector('.hamburger');
const drawer = document.querySelector('.drawer');
const overlay = document.querySelector('.drawer-overlay');
const closeBtn = document.querySelector('.drawer-close');

function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
}

function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
}

hamburger.addEventListener('click', openDrawer);
closeBtn.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);

const tabs = document.querySelectorAll('.tab');
const products = document.querySelector('.products');
const productCards = document.querySelectorAll('.product-card');
const prevProductBtn = document.querySelector('.products-wrapper .arrow-btn.left');
const nextProductBtn = document.querySelector('.products-wrapper .arrow-btn.right');
const productOrder = ['Chair', 'Beds', 'Sofa', 'Lamp'];
const mobileProductsQuery = window.matchMedia('(max-width: 787px)');
const twoProductQuery = window.matchMedia('(max-width: 1120px)');
const compactProductsQuery = window.matchMedia('(max-width: 1420px)');
let activeProductIndex = 0;
let activeCarouselProductIndex = 0;
let isProductSliding = false;
const productImagePool = [
    'images/image-2.jpg',
    'images/image-3.jpg',
    'images/image-4.jpg',
    'images/image-5.jpg',
    'images/image-6.jpg',
    'images/image-7.jpg',
    'images/image-8.jpg'
];
const productSets = {
    Chair: [
        { category: 'Chair', name: 'Sakarias Armchair', price: '392', image: 'images/armchair-1.png' },
        { category: 'Chair', name: 'Baltsar Chair', price: '299', image: 'images/armchair-2.png' },
        { category: 'Chair', name: 'Anjay Chair', price: '519', image: 'images/armchair-3.png' },
        { category: 'Chair', name: 'Nyantuy Chair', price: '921', image: 'images/armchair-4.png' }
    ],
    Beds: [
        { category: 'Bed', name: 'Luna Bed', price: '1249', image: 'images/bed-1.png' },
        { category: 'Bed', name: 'Nora Storage Bed', price: '1390', image: 'images/bed-2.png' },
        { category: 'Bed', name: 'Kova Bed', price: '1185', image: 'images/bed-3.png' },
        { category: 'Bed', name: 'Mira Canopy Bed', price: '1520', image: 'images/bed-4.png' }
    ],
    Sofa: [
        { category: 'Sofa', name: 'Arden Sofa', price: '980', image: 'images/sofa-1.png' },
        { category: 'Sofa', name: 'Mellow Loveseat', price: '760', image: 'images/sofa-2.png' },
        { category: 'Sofa', name: 'Oslo Sofa', price: '1680', image: 'images/sofa-3.png' },
        { category: 'Sofa', name: 'Vale Daybed Sofa', price: '1125', image: 'images/sofa-4.png' }
    ],
    Lamp: [
        { category: 'Lamp', name: 'Nola Table Lamp', price: '145', image: 'images/lamp-1.png' },
        { category: 'Lamp', name: 'Brio Lamp', price: '230', image: 'images/lamp-2.png' },
        { category: 'Lamp', name: 'Halo Lamp', price: '310', image: 'images/lamp-3.png' },
        { category: 'Lamp', name: 'Elio Lamp', price: '118', image: 'images/lamp-4.png' }
    ]
};

function onMediaQueryChange(query, callback) {
    if (query.addEventListener) {
        query.addEventListener('change', callback);
    } else {
        query.addListener(callback);
    }
}

function renderProductCard(card, product, imageSource) {
    const imageWrap = card.querySelector('.product-image-wrapper');
    const image = card.querySelector('.product-img');

    card.querySelector('.product-category').textContent = product.category;
    card.querySelector('.product-name').textContent = product.name;
    card.querySelector('.product-price').innerHTML = `<sup>$</sup> ${product.price}`;

    if (imageSource) {
        image.src = imageSource;
        image.alt = product.name;
        image.style.display = 'block';
        imageWrap.classList.remove('product-image-empty');
    } else {
        image.removeAttribute('src');
        image.alt = '';
        image.style.display = 'none';
        imageWrap.classList.add('product-image-empty');
    }
}

function renderProducts(type) {
    const shuffledImages = [...productImagePool].sort(() => Math.random() - 0.5);

    productCards.forEach((card, index) => {
        const product = productSets[type][index];
        const productImage = product.image || shuffledImages[index % shuffledImages.length];

        renderProductCard(card, product, productImage);
    });
}

function getCarouselProductsPerTab() {
    if (mobileProductsQuery.matches) {
        return productSets[productOrder[0]].length;
    }

    return getVisibleProductCount();
}

function normalizeMobileProductIndex(index) {
    const productsPerTab = getCarouselProductsPerTab();
    const productCount = productOrder.length * productsPerTab;

    return (index + productCount) % productCount;
}

function getVisibleProductCount() {
    if (mobileProductsQuery.matches) {
        return 1;
    }

    if (twoProductQuery.matches) {
        return 2;
    }

    return 3;
}

function getProductByGlobalIndex(index) {
    const productsPerTab = getCarouselProductsPerTab();
    const normalizedIndex = normalizeMobileProductIndex(index);
    const tabIndex = Math.floor(normalizedIndex / productsPerTab);
    const itemIndex = normalizedIndex % productsPerTab;
    const type = productOrder[tabIndex];
    const product = productSets[type][itemIndex];
    const productImage = product.image || productImagePool[normalizedIndex % productImagePool.length];

    return { normalizedIndex, tabIndex, type, product, productImage };
}

function renderCarouselProducts(nextIndex) {
    const visibleCount = getVisibleProductCount();
    const firstProduct = getProductByGlobalIndex(nextIndex);

    activeProductIndex = firstProduct.tabIndex;
    activeCarouselProductIndex = firstProduct.normalizedIndex;
    setActiveProductTab(firstProduct.type);

    productCards.forEach((card, index) => {
        if (index >= visibleCount) {
            return;
        }

        const productData = getProductByGlobalIndex(firstProduct.normalizedIndex + index);
        renderProductCard(card, productData.product, productData.productImage);
    });
}

function updateCarouselProducts(nextIndex) {
    const normalizedIndex = normalizeMobileProductIndex(nextIndex);

    if (isProductSliding || normalizedIndex === activeCarouselProductIndex) {
        return;
    }

    isProductSliding = true;
    products.classList.add('is-changing');

    setTimeout(() => {
        renderCarouselProducts(normalizedIndex);

        requestAnimationFrame(() => {
            products.classList.remove('is-changing');

            setTimeout(() => {
                isProductSliding = false;
            }, 220);
        });
    }, 160);
}

function setActiveProductTab(type) {
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.textContent.trim() === type);
    });
}

function updateProducts(nextIndex) {
    if (isProductSliding || nextIndex === activeProductIndex) {
        return;
    }

    const nextType = productOrder[nextIndex];

    isProductSliding = true;
    products.classList.add('is-changing');

    setTimeout(() => {
        renderProducts(nextType);
        setActiveProductTab(nextType);
        activeProductIndex = nextIndex;

        requestAnimationFrame(() => {
            products.classList.remove('is-changing');

            setTimeout(() => {
                isProductSliding = false;
            }, 220);
        });
    }, 160);
}

tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        if (compactProductsQuery.matches) {
            const nextIndex = index * getCarouselProductsPerTab();
            updateCarouselProducts(nextIndex);
            return;
        }

        updateProducts(index);
    });
});

prevProductBtn.addEventListener('click', () => {
    if (compactProductsQuery.matches) {
        updateCarouselProducts(activeCarouselProductIndex - getVisibleProductCount());
        return;
    }

    const nextIndex = (activeProductIndex - 1 + productOrder.length) % productOrder.length;
    updateProducts(nextIndex);
});

nextProductBtn.addEventListener('click', () => {
    if (compactProductsQuery.matches) {
        updateCarouselProducts(activeCarouselProductIndex + getVisibleProductCount());
        return;
    }

    const nextIndex = (activeProductIndex + 1) % productOrder.length;
    updateProducts(nextIndex);
});

onMediaQueryChange(compactProductsQuery, event => {
    if (event.matches) {
        renderCarouselProducts(activeProductIndex * getCarouselProductsPerTab());
    } else {
        renderProducts(productOrder[activeProductIndex]);
        setActiveProductTab(productOrder[activeProductIndex]);
    }
});

onMediaQueryChange(mobileProductsQuery, event => {
    if (compactProductsQuery.matches) {
        renderCarouselProducts(activeCarouselProductIndex);
    }
});

onMediaQueryChange(twoProductQuery, event => {
    if (compactProductsQuery.matches) {
        renderCarouselProducts(activeCarouselProductIndex);
    }
});

const testimonialsSection = document.querySelector('.testimonials');
const testimonialsCards = document.querySelector('.testimonials-cards');
const prevTestimonialBtn = document.querySelector('.testimonials-wrapper .arrow-btn.left');
const nextTestimonialBtn = document.querySelector('.testimonials-wrapper .arrow-btn.right');
const testimonialViewAll = document.querySelector('.testimonial-view-all');
let isTestimonialChanging = false;

function updateTestimonials(direction) {
    if (isTestimonialChanging) {
        return;
    }

    isTestimonialChanging = true;
    testimonialsCards.classList.add('is-changing');

    setTimeout(() => {
        if (direction === 'prev') {
            testimonialsCards.insertBefore(testimonialsCards.lastElementChild, testimonialsCards.firstElementChild);
        } else {
            testimonialsCards.appendChild(testimonialsCards.firstElementChild);
        }

        requestAnimationFrame(() => {
            testimonialsCards.classList.remove('is-changing');

            setTimeout(() => {
                isTestimonialChanging = false;
            }, 220);
        });
    }, 160);
}

prevTestimonialBtn.addEventListener('click', () => updateTestimonials('prev'));
nextTestimonialBtn.addEventListener('click', () => updateTestimonials('next'));

testimonialViewAll.addEventListener('click', event => {
    event.preventDefault();
    testimonialsSection.classList.add('show-all');
});

const colorPopups = document.querySelectorAll('.color-popup');
const heroBackground = document.querySelector('.hero-bg-img');
const heroImages = [
    'images/imagem-1-orange.jpg',
    'images/imagem-1-blue.jpg',
    'images/imagem-1-grey.jpg'
];

heroImages.forEach(src => {
    const image = new Image();
    image.src = src;
});

function updateHeroBackground(src) {
    heroBackground.src = src;
}

colorPopups.forEach(popup => {
    const colorOptions = popup.querySelectorAll('.color-option');
    const selectedIcon = popup.querySelector('.color-option img');

    popup.addEventListener('click', event => {
        const option = event.target.closest('.color-option');

        if (!option) {
            return;
        }

        event.stopPropagation();

        colorOptions.forEach(item => item.classList.remove('active'));
        option.classList.add('active');
        option.appendChild(selectedIcon);

        if (option.dataset.heroImage) {
            updateHeroBackground(option.dataset.heroImage);
        }
    });
});
