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

1. Resource Group: Resource group name
2. Location: (String) Resource Location.
3. App Name: Unique name of the app to create or update.
4. Service Plan ID: Resource ID of the associated App Service plan, formatted as: "/subscriptions/{subscriptionID}/resourceGroups/{groupName}/providers/Microsoft.Web/serverfarms/{appServicePlanName}"

5. Site Config AlwaysOn (Boolean), true if Always On is enabled; otherwise, false.
6. SiteConfig (Obj), Configuration of an App Service app.

## Method: Create Service Plan

**Description:**

This method creates a service plan following the [documentation](https://docs.microsoft.com/en-us/rest/api/appservice/appserviceplans/createorupdate)

**Parameters**

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

1. Resource Group Name: Resource group name
2. Location: Resource Location
3. App Name: Name of the app
4. Slot Name: Slot name
