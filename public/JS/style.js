const toggleButton = document.getElementById('toggle');
const toggle = document.getElementById('toggle');
const header = document.getElementById('header');
const pdftools = document.querySelector('.pdf-tools');
const listgroup = document.querySelector('.list-group');
const pdftool = document.querySelectorAll('.pdf-tool');
const proflie = document.getElementsByClassName('profile').f
const myDiv = document.getElementById('container-form');
window.addEventListener('resize', () => {
    if (window.matchMedia("(orientation: portrait)").matches) {
        header.classList.remove('p-3');
        myDiv.classList.remove('w-75');
        myDiv.classList.add('w-100');
        toggle.classList.remove('d-none');
        pdftools.classList.add('active');
        pdftool.forEach(element => {
            element.classList.add('invisible');
        });
    } else {
        header.classList.add('p-3');
        myDiv.classList.remove('w-100');
        pdftools.classList.remove('active');
        toggle.classList.add('d-none');
        myDiv.classList.add('w-75');
        myDiv.classList.add('ml-auto');
        pdftool.forEach(element => {
            element.classList.remove('invisible');
        });
    }
});

toggleButton.addEventListener('click', () => {
    pdftools.classList.toggle('active');
    pdftools.style.transition = 'width 0.3s ease-in';
    pdftools.style.transform = 'translateX(-100%)'; // Initially translate off-screen
    pdftools.style.width = '0px'; // Initially set width to 0

    if (pdftools.classList.contains('active')) {
        pdftools.style.transform = 'translateX(0)'; // On show, translate back to visible position
        pdftools.style.width = '25vw'; // Set width to 25%
    }
    else{
        pdftools.style.transition = 'width 0.3s ease-out';
    }
    pdftool.forEach(element => {
        element.classList.toggle('invisible');
    });
});

//     toggleButton.addEventListener('click', () => {
//         pdftools.classList.toggle('width');
//         listgroup.classList.toggle('bg-light');
//         // Add CSS transitions for smoother effects and adjust initial state
//        

//     // // Add CSS transitions for smoother effects
// })
// Initial check on page load
window.dispatchEvent(new Event('resize'))