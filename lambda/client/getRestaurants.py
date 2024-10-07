import json
import boto3

def lambda_handler(event, context):
    client = boto3.client('cognito-idp', region_name='us-west-2')

    user_pool_id = 'us-west-2_s6rhkaq7V'

    users = []
    
    try:
        response = client.list_users(UserPoolId=user_pool_id, Limit=50)

        users.extend(response['Users'])

        while 'PaginationToken' in response:
            response = client.list_users(UserPoolId=user_pool_id, PaginationToken=response['PaginationToken'], Limit=50)
            users.extend(response['Users'])

        formatted_users = []

        for user in users:
            user_info = {'Username': user['Username']}

            for attribute in user['Attributes']:
                if attribute['Name'] == 'email':
                    user_info['Email'] = attribute['Value']
                elif attribute['Name'] == 'name':
                    user_info['Name'] = attribute['Value']
                elif attribute['Name'] == 'phone_number':
                    user_info['PhoneNumber'] = attribute['Value']

            formatted_users.append(user_info)

        return {
            'statusCode': 200,
            'body': formatted_users 
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': {'error': str(e)}
        }
