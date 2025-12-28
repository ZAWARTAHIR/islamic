function saveSelection(country, city) {
    localStorage.setItem("ramzanCountry", country);
    localStorage.setItem("ramzanCity", city);
}

function loadSelection() {
    return {
        country: localStorage.getItem("ramzanCountry"),
        city: localStorage.getItem("ramzanCity")
    };
}
