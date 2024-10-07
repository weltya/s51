import json
import boto3

sns_client = boto3.client('sns', region_name='us-west-2')

SNS_TOPIC_ARN = 'arn:aws:sns:us-west-2:340752829945:applicationRestaurant'


def lambda_handler(event, context):
    """
    Gère l'inscription d'un restaurant à un sujet SNS en utilisant les paramètres de requête.
    """
    try:
        params = event.get('queryStringParameters', {})
        restaurant_email = params.get("restaurantEmail")

        if not restaurant_email:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
                },
                'body': json.dumps({'message': 'L\'e-mail du restaurant est requis en tant que paramètre de requête.'})
            }

        response = sns_client.subscribe(
            TopicArn=SNS_TOPIC_ARN,
            Protocol='email',
            Endpoint=restaurant_email
        )

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            },
            'body': json.dumps({'message': f'Un e-mail de confirmation a été envoyé à {restaurant_email}. Veuillez vérifier et confirmer l\'abonnement.'})
        }

    except Exception as e:
        print(f"Erreur lors de l'abonnement à SNS : {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            },
            'body': json.dumps({'message': f"Erreur lors de l'abonnement : {str(e)}"})
        }
