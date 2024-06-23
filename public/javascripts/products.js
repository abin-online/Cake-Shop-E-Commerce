
/// Add to wishlist ////////////

const addToWishlist = async (id) => {

    const proName = document.getElementById('name' + id).value
    document.getElementById('click' + id).innerHTML =
        `<a aria-label="Add To Wishlist"
    class="wish action-btn hover-up" href="#"><i class="fa-solid fa-heart"></i></a>`

    let response = await fetch(`/add_to_wishlist?id=${id}`, {
        headers: {
            "Content-Type": "application/json"
        },
    })

    let data = await response.json()
    if (data) {
        alertify.set('notifier', 'position', 'bottom-center');
        alertify.success(`${proName} Added to wishlist`)
        //.then(()=> window.location.reload())
    }
}


/// remove from wishlist  ////////////


const removeFromWishlist = async (id) => {
    const proName = document.getElementById('name' + id).value

    document.getElementById('click' + id).innerHTML =
        `<a aria-label="Add To Wishlist" class="wish action-btn hover-up" href="#"><i class="fi-rs-heart"></i></a>`

    let response = await fetch(`/remove_from_wishlist?id=${id}`, {
        headers: {
            "Content-Type": "application/json"
        },
    })

    let data = await response.json()
    if (data) {
        alertify.set('notifier', 'position', 'bottom-center');
        alertify.success(`${proName} Removed from wishlist`)
    }
}





