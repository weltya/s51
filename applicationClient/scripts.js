var API_ENDPOINT_GET_RESTAURANT =
  "https://5dvqdqmrq8.execute-api.us-west-2.amazonaws.com/prod/getRestaurants";
var API_ENDPOINT_POST_RESERVATION =
  "https://5dvqdqmrq8.execute-api.us-west-2.amazonaws.com/prod/postReservation";

document.getElementById("saveReservation").onclick = function () {
  var inputData = {
    restaurantName: $("#restaurantName").val(),
    restaurantEmail: $("#restaurantEmail").val(),
    restaurantPhone: $("#restaurantPhone").val(),
    reservationDate: $("#reservationDate").val(),
    clientName: $("#userNameDisplay").text(),
    clientEmail: $("#userEmailDisplay").text(),
    clientPhone: $("#userPhoneNumberDisplay").text(),
  };

  $.ajax({
    url: API_ENDPOINT_POST_RESERVATION,
    type: "POST",
    data: JSON.stringify(inputData),
    contentType: "application/json; charset=utf-8",
    success: function (response) {
      alert("Réservation client enregistrée avec succès !");
    },
    error: function () {
      alert("Erreur lors de l'enregistrement de la réservation.");
    },
  });
};

document.getElementById("getRestaurants").onclick = function () {
  $.ajax({
    url: API_ENDPOINT_GET_RESTAURANT,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    success: function (response) {
      let restaurantsData = response.body;

      if (typeof restaurantsData === "string") {
        restaurantsData = JSON.parse(restaurantsData);
      }

      $("#showRestaurantsTable tr").slice(1).remove();

      jQuery.each(restaurantsData, function (i, data) {
        $("#showRestaurantsTable").append(
          "<tr> \
            <td>" +
            (data["Username"] || "") +
            "</td> \
            <td>" +
            (data["Name"] || "") +
            "</td> \
            <td>" +
            (data["Email"] || "") +
            "</td> \
            <td>" +
            (data["PhoneNumber"] || "") +
            "</td> \
          </tr>"
        );
      });
    },
    error: function () {
      alert("Error retrieving restaurants data.");
    },
  });
};

document.getElementById("getClientReservation").onclick = function () {
  var CLIENT_MAIL = $("#userEmailDisplay").text().trim();

  if (!CLIENT_MAIL) {
    alert(
      "L'email du client est manquant. Veuillez vérifier l'affichage de l'email."
    );
    return;
  }

  var API_ENDPOINT_GET_RESERVATION =
    "https://5dvqdqmrq8.execute-api.us-west-2.amazonaws.com/prod/test?clientEmail=" +
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
            (data["restaurantName"] || "") +
            "</td> \
                <td>" +
            (data["restaurantEmail"] || "") +
            "</td> \
                <td>" +
            (data["restaurantPhone"] || "") +
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
