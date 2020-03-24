const msRest = require('@azure/ms-rest-nodeauth');
import { WebSiteManagementClient, WebSiteManagementModels } from 'azure-arm-website';

module.exports = {
    createApp: createApp,
    createDeploymentSlot : createDeploymentSlot,
    createServicePlan: createServicePlan
}

/**
 * Internal function for handling authentication and generation of website managmnet client
 * @param {*} action 
 * @param {*} settings 
 * @returns Promise<WebSiteManagementClient>
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
            return new WebSiteManagementClient(credentials, (action.params.subscriptionId || settings.subscriptionId));
        });
}

function createApp(action,settings){
    return _getWebSiteManagementClient(action,settings).then(webManagementClient=>{
        
        if(typeof action.params.siteConfig == 'string'){
            try {
                action.params.siteConfig = JSON.parse(action.params.siteConfig);
            } catch (e) {
                action.params.siteConfig = {};
            }
        } else {
            action.params.siteConfig = action.params.siteConfig || {};
        } 

        /**
         * @type WebSiteManagementModels.SiteConfig
         */
        const siteConfig = {
            alwaysOn : action.params.siteConfigAlwaysOn,
            appCommandLine: action.params.siteConfigAppCl,
            ...action.params.siteConfig
        };

        /**
         * @type WebSiteManagementModels.Site
         */
        const webApp = {
            location : action.params.location,
            serverFarmId: action.params.servicePlanID,
            enabled: true,
            siteConfig: siteConfig
        }
        
        return webManagementClient.webApps.createOrUpdate(action.params.resourceGroupName, action.params.name, webApp);
    })
}

function createDeploymentSlot(action, settings){
    return _getWebSiteManagementClient(action,settings).then(webManagementClient=>{
        
        /**
         * @type WebSiteManagementModels.Deployment
         */
        const deploymentSlot = {
            location : action.params.location,
            name : action.params.slotName
        }

        return webManagementClient.webApps.createDeploymentSlot(action.params.resourceGroupName, action.parmas.appName, "", action.params.slotName, deploymentSlot)
    })
}

function createServicePlan(action,settings){
    return _getWebSiteManagementClient(action,settings).then(webManagementClient=>{
        
        /**
         * @type WebSiteManagementModels.AppServicePlan
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
        
        webManagementClient.appServicePlans.createOrUpdate(action.params.resourceGroupName, action.params.name, servicePlan)
    })
}
