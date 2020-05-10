const msRest = require('@azure/ms-rest-nodeauth');
const armWebsite = require('azure-arm-website');


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
            return new armWebsite.WebSiteManagementClient(credentials, (action.params.subscriptionId || settings.subscriptionId));
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
        let siteConfig = {
            alwaysOn : alwaysOn,
            appCommandLine: action.params.siteConfigAppCl || undefined
        };

        if(action.params.siteConfig)
            siteConfig = Object.assign(siteConfig,action.params.siteConfig)


        /**
         * @type armWebsite.WebSiteManagementModels.Site
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
         * @type armWebsite.WebSiteManagementModels.Deployment
         */
        const deploymentSlot = {
            location : action.params.location,
            name : action.params.slotName
        }

        return webManagementClient.webApps.createDeploymentSlot(action.params.resourceGroupName, action.params.appName, "", action.params.slotName, deploymentSlot)
    })
}

function createServicePlan(action,settings){
    return _getWebSiteManagementClient(action,settings).then(webManagementClient=>{
        
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
        
        webManagementClient.appServicePlans.createOrUpdate(action.params.resourceGroupName, action.params.name, servicePlan)
    })
}
