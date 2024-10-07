document.getElementById("getClientReservation").onclick = function () {
  var CLIENT_MAIL = $("#userEmailDisplay").text().trim();

  if (!CLIENT_MAIL) {
    alert(
      "L'email du client est manquant. Veuillez vérifier l'affichage de l'email."
    );
    return;
  }

  var API_ENDPOINT_GET_RESERVATION =
    "https://5dvqdqmrq8.execute-api.us-west-2.amazonaws.com/prod/getReservationsRestaurant?clientEmail=" +
    encodeURIComponent(CLIENT_MAIL);

  console.log("URL de l'API :", API_ENDPOINT_GET_RESERVATION);

  fetch(API_ENDPOINT_GET_RESERVATION, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }
      return response.json();
    })
    .then((reservationsData) => {
      console.log("Données des réservations :", reservationsData);

      if (!Array.isArray(reservationsData)) {
        console.error(
          "La réponse n'est pas un tableau. Réponse actuelle :",
          reservationsData
        );
        alert(
          "Format de réponse inattendu. Veuillez vérifier la réponse de l'API."
        );
        return;
      }

      if (reservationsData.length === 0) {
        alert("Aucune réservation trouvée pour ce client.");
        return;
      }

      $("#clientReservationTable tr").slice(1).remove();

      reservationsData.forEach((data) => {
        $("#clientReservationTable").append(
          "<tr> \
                <td>" +
            (data["reservationDate"] || "") +
            "</td> \
                <td>" +
            (data["clientName"] || "") +
            "</td> \
                <td>" +
            (data["clientEmail"] || "") +
            "</td> \
                <td>" +
            (data["clientPhone"] || "") +
            "</td> \
              </tr>"
        );
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la requête API :", error);
      alert(
        "Erreur lors de la récupération des réservations du client. Veuillez vérifier la console pour plus de détails."
      );
    });
};

document.getElementById("subscribeButton").onclick = function () {
  var RESTAURANT_EMAIL = document
    .getElementById("userEmailDisplay")
    .textContent.trim();

  if (!RESTAURANT_EMAIL) {
    alert(
      "L'email du restaurant est manquant. Veuillez vérifier l'affichage de l'email."
    );
    return;
  }

  var API_ENDPOINT_SUBSCRIBE =
    "https://5dvqdqmrq8.execute-api.us-west-2.amazonaws.com/prod/subscribeSns?restaurantEmail=" +
    encodeURIComponent(RESTAURANT_EMAIL);

  console.log("URL de l'API :", API_ENDPOINT_SUBSCRIBE);

  fetch(API_ENDPOINT_SUBSCRIBE, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Réponse de l'API :", data);
      document.getElementById("message").innerText =
        data.message || "Inscription réussie !";
    })
    .catch((error) => {
      console.error("Erreur lors de la requête API :", error);
      alert(
        "Erreur lors de l'inscription. Veuillez vérifier la console pour plus de détails."
      );
    });
};
