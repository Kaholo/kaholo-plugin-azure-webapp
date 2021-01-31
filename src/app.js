const msRest = require('@azure/ms-rest-nodeauth');
const armWebsite = require('@azure/arm-appservice');
const fetch = require('node-fetch');
const { getResourceGroups, getServicePlans, getApps, getDeploymentSlots } = require('./autocomplete');
const fs = require('fs');
const parsers = require('./parsers');

/**
 * Internal function for handling authentication and generation of website managmnet client
 * @param {*} action 
 * @param {*} settings 
 * @returns Promise<armWebsite.WebSiteManagementClient>
 */
function _getWebSiteManagementClient(action, settings) {
	/**
	 * Create credentials from the clientId, secret and domain
	 */
    return msRest.loginWithServicePrincipalSecret(
        settings.clientId, settings.secret, settings.domain).then(credentials => {
			/**
			 * Create new webapps mamagement client using the credentials and subscription ID
			 * And returns the new webapps mamagement client
			 */
            return new armWebsite.WebSiteManagementClient(credentials, (action.params.subscriptionId || settings.subscriptionId));
        });
}

async function deployZipToApp(action,settings){
    const zipPath = action.params.zipPath;
    const applicationName = parsers.autocomplete(action.params.app);
    const username = action.params.username; 
    const password = action.params.password; 
    
    const zipFileSize = await new Promise((resolve,reject)=>{
        fs.stat(zipPath,((err,stats)=>{
            if (err) return reject(err);
            resolve(stats.size);
        }))
    });

    const zipFileStream = fs.createReadStream(zipPath);
    
    const url = `https://${applicationName}.scm.azurewebsites.net/api/zipdeploy`;
    const result = await fetch(url, {
        method: "POST",
        headers: {
            "Content-length": zipFileSize,
            "Authorization": `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
        },
        body: zipFileStream,
        bodyIsStream: true
    });

    const text = await result.text();
    if (!result.ok){
        throw text;
    }

    return text;
}


async function createApp(action,settings){

    const webManagementClient = await _getWebSiteManagementClient(action,settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const servicePlan = parsers.autocomplete(action.params.servicePlanID);
    const appName = action.params.name;
    let alwaysOn = false;

    if (typeof action.params.siteConfigAlwaysOn == 'string'){
        if (action.params.siteConfigAlwaysOn === "true")
            alwaysOn = true;
    } else if (typeof action.params.siteConfigAlwaysOn === 'boolean'){
        alwaysOn = action.params.siteConfigAlwaysOn;
    }

    /**
    * @type armWebsite.WebSiteManagementModels.SiteConfig
    */
    const siteConfig = Object.assign ({
        alwaysOn : alwaysOn,
        appCommandLine: action.params.siteConfigAppCl || undefined
    }, action.params.siteConfig || {});


    /**
     * @type armWebsite.WebSiteManagementModels.Site
     */
    const webApp = {
        location : action.params.location,
        serverFarmId: `/subscriptions/${action.params.subscriptionId || settings.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Web/serverFarms/${servicePlan}`,
        enabled: true,
        siteConfig: siteConfig
    }
        
    return webManagementClient.webApps.createOrUpdate(resourceGroupName, appName, webApp);
}

async function createDeploymentSlot(action, settings){
    const webManagementClient = await _getWebSiteManagementClient(action,settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const appName = action.params.appName;
    const slotName = action.params.slotName;

    /**
     * @type armWebsite.WebSiteManagementModels.Site
     */
    const site = {
        location : action.params.location,
        enabled : true
    }

    return webManagementClient.webApps.createOrUpdateSlot(resourceGroupName, appName, site, slotName);
}

async function createServicePlan(action,settings){
    const webManagementClient = await _getWebSiteManagementClient(action,settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);

    /**
     * @type armWebsite.WebSiteManagementModels.AppServicePlan
     */
    const servicePlan = {
        location : action.params.location,
        reserved: action.params.reserved,
        isXenon: action.params.isXenon,
        hyperV: action.params.hyperV,
        sku: {
            tier : action.params.skuTier,
            size : action.params.skuSize
        }
    }
        
    webManagementClient.appServicePlans.createOrUpdate(resourceGroupName, action.params.name, servicePlan)
}

async function deleteApp(action,settings){
    const webManagementClient = await _getWebSiteManagementClient(action,settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const appName = parsers.autocomplete(action.params.name);
    
    return webManagementClient.webApps.deleteMethod(resourceGroupName, appName);
}

async function deleteDeploymentSlot(action, settings){
    const webManagementClient = await _getWebSiteManagementClient(action,settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const appName = parsers.autocomplete(action.params.appName);
    const slotName = parsers.autocomplete(action.params.slotName);
    
    return webManagementClient.webApps.deleteSlot(resourceGroupName,appName,slotName);
}

async function deleteServicePlan(action,settings){
    const webManagementClient = await _getWebSiteManagementClient(action,settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const planName = parsers.autocomplete(action.params.name);
    
    webManagementClient.appServicePlans.deleteMethod(resourceGroupName, planName);
}

async function cloneApp(action,settings){

    const webManagementClient = await _getWebSiteManagementClient(action,settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const baseAppName = parsers.autocomplete(action.params.name);
    const newAppName = action.params.newAppName;
    const servicePlan = parsers.autocomplete(action.params.servicePlanID);
    
    const baseApp = await webManagementClient.webApps.get(resourceGroupName, baseAppName);
    
    const serverFarmId = servicePlan ? 
        `/subscriptions/${action.params.subscriptionId || settings.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Web/serverFarms/${servicePlan}` : 
        baseApp.serverFarmId;

    /**
     * @type armWebsite.WebSiteManagementModels.Site
     */
    const webApp = {
        location : action.params.location || baseApp.location,
        serverFarmId: serverFarmId,
        enabled: true,
        siteConfig: baseApp.siteConfig
    }
        
    return webManagementClient.webApps.createOrUpdate(resourceGroupName, newAppName, webApp);
}

module.exports = {
    deleteApp,
    createApp,
    deleteDeploymentSlot,
    createDeploymentSlot,
    deleteServicePlan,
    createServicePlan,
    deployZipToApp,
    cloneApp,
    // Autocomplete
    getResourceGroups,
    getServicePlans, 
    getApps,
    getDeploymentSlots
}