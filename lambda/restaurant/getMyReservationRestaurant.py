import json
import boto3
from boto3.dynamodb.conditions import Attr 

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')

table = dynamodb.Table('ReservationData') 

def lambda_handler(event, context):
    try:
        params = event.get('queryStringParameters', {})
        client_email = params.get("clientEmail")

        if not client_email:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
                },
                'body': json.dumps({'error': 'clientEmail parameter is required'})
            }

        response = table.scan(
            FilterExpression=Attr('restaurantEmail').eq(client_email)
        )

        reservations = []

        for item in response.get('Items', []):
            reservation_info = {
                'reservationDate': item.get('reservationDate', 'N/A'),
                'clientEmail': item.get('clientEmail', 'N/A'),
                'clientPhone': item.get('clientPhone', 'N/A'),
                'clientName': item.get('clientName', 'N/A')
            }

            reservations.append(reservation_info)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            },
            'body': json.dumps(reservations)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            },
            'body': json.dumps({'error': f"Error retrieving reservation data: {str(e)}"})
        }
