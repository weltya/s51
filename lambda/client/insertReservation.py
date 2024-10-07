import json
import boto3
import uuid


dynamodb = boto3.resource('dynamodb')
sns_client = boto3.client('sns', region_name='us-west-2')
table = dynamodb.Table('ReservationData')
SNS_TOPIC_ARN = 'arn:aws:sns:us-west-2:340752829945:applicationRestaurant'

def lambda_handler(event, context):
    try:
        restaurant_name = event.get('restaurantName', 'default_restaurant')
        restaurant_email = event.get('restaurantEmail', 'default_email')
        restaurant_phone = event.get('restaurantPhone', 'default_phone')
        reservation_date = event.get('reservationDate', 'default_date')
        client_name = event.get('clientName', 'default_client')
        client_email = event.get('clientEmail', 'default_client_email')
        client_phone = event.get('clientPhone', 'default_client_phone')

        reservation_id = str(uuid.uuid4())

        response = table.put_item(
            Item={
                'reservationId': reservation_id,
                'restaurantName': restaurant_name,
                'restaurantEmail': restaurant_email,
                'restaurantPhone': restaurant_phone,
                'reservationDate': reservation_date,
                'clientName': client_name,
                'clientEmail': client_email,
                'clientPhone': client_phone,
            }
        )

        print("Réservation enregistrée dans DynamoDB")

        sns_message = (
            f"Bonjour {restaurant_name},\n\n"
            f"Vous avez une nouvelle réservation ! Voici les détails :\n"
            f"Date de la réservation : {reservation_date}\n"
            f"Nom du client : {client_name}\n"
            f"E-mail du client : {client_email}\n"
            f"Téléphone du client : {client_phone}\n\n"
            f"Veuillez vérifier votre système de réservation pour plus d'informations.\n\n"
            f"Merci,\nL'équipe de gestion des réservations"
        )

        print("Message SNS créé")

        response = sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Message=sns_message,
            Subject=f"Nouvelle réservation pour {restaurant_name}"
        )

        print(f"Notification envoyée via SNS : {response}")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Reservation saved and notification sent successfully!', 'reservationId': reservation_id})
        }

    except Exception as e:
        print(f"Erreur lors de l'abonnement à SNS : {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Error saving reservation data or sending notification: {str(e)}"})
        }
