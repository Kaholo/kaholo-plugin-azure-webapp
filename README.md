# kaholo-plugin-azure-webapp
Azure Webapp plugin for Kaholo

**Description:**

**Settings**

1. Client or App ID
2. Secret or Password
3. Domain or Tenant ID
4. Subscription ID

## Method: Create App

**Description:**
This method is based on the following [documentation](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/createorupdate)
Creates a new web, mobile, or API app in an existing resource group, or updates an existing app.

**Parameters**

1. Resource Group: Resource group
2. Location: (String) Resource Location.
3. App Name: Unique name of the app to create or update.
4. Service Plan: The service plan for the new app.
5. Site Config AlwaysOn (Boolean), true if Always On is enabled; otherwise, false.
6. SiteConfig (Obj), Configuration of an App Service app.
## Method: Clone App

**Description:**
This method clones an existing app service. It gets the original app and uses it's SiteConfig for the new webapp.

**Parameters**

1. Resource Group: Resource group
3. App: The app to clone.
2. Location: (String) New app location.
4. Service Plan: The service plan for the new app.

## Method: Create Service Plan

**Description:**

This method creates a service plan following the [documentation](https://docs.microsoft.com/en-us/rest/api/appservice/appserviceplans/createorupdate)

**Parameters**

1. Resource Group: Resource group
1. Location: (String), Resource Location
2. Service Plan Name: (String) Name of the App Service plan.

Description of a SKU for a scalable resource.

3. SKU Tier: (String), Service tier of the resource SKU.
4. SKU Size: (String), Size specifier of the resource SKU.
5. Reserved: (Boolean), If Linux app service plan true, false otherwise.
6. Is Xenon: (Boolean), Obsolete: If Hyper-V container app service plan true, false otherwise.
7. HyperV: (Boolean), If Hyper-V container app service plan true, false otherwise.


## Method: Create Deployment Slot

**Description:**

This method create s Deployment slot following the [documentation](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/createorupdateslot)

**Parameters**

1. Resource Group: Resource group
2. Location: Resource Location
3. App Name: Name of the app
4. Slot Name: Slot name

## Method: Delete App

**Description:**

This method deletes an app. More information can be found on Azure's [documentation](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/delete)

**Parameters**

1. Resource Group: Resource group
2. App: The name of the app to delete.


## Method: Delete Deployment Slot

**Description:**

This method deletes a deployment slot. More information can be found on Azure's [documentation](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/deletedeploymentslot)

**Parameters**

1. Resource Group: Resource group
2. App: The name of the app that contains the deployment slot.
3. Slot: The slot to delete.

## Method: Delete Service Plan

**Description:**

This method deletes a service plan. More information can be found on Azure's [documentation](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/deletedeploymentslot)

**Parameters**

1. Resource Group: Resource group
2. Plan: The plan to delete.

## Method: Deploy zip to app

**Description:**

This method deploys a zip file to a service app. More information can be found on Azure's [documentation](https://docs.microsoft.com/en-us/azure/app-service/deploy-zip)

In order to use this method deployment username and password are required. These should be preconfigured on the app. You can further read on Azure's [documetnation](https://docs.microsoft.com/en-us/azure/app-service/deploy-configure-credentials)

**Parameters**

1. Zip Path - the path of the zip file to upload.
2. App: The service app to upload the zip to
3. Username: the deployment user to use.
2. Password: the deployment user password.