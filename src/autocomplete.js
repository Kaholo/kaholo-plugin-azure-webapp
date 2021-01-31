const msRest = require("@azure/ms-rest-nodeauth");
const armResources = require("@azure/arm-resources");
const armAppService = require("@azure/arm-appservice");
const parsers = require("./parsers");

function paramsMapper(pluginSettings, actionParams) {
    const settings = {};
    const params = {};

    if (pluginSettings && pluginSettings.length > 0) {
        pluginSettings.forEach((setting) => {
            settings[setting.name] = setting.value;
        });
    }

    if (actionParams && actionParams.length > 0) {
        actionParams.forEach((param) => {
            params[param.name] = param.value;
        });
    }

    return { settings, params };
}

async function getResourceGroups(query, pluginSettings, actionParams) {
    const { settings } = paramsMapper(pluginSettings, actionParams);

    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const client = new armResources.ResourceManagementClient(credentials, settings.subscriptionId);
    const groups = await client.resourceGroups.list();

    return (
        groups
            // Filter only groups matching query
            .filter((group) => group.name.toLowerCase().includes(query.toLowerCase()))
            // Map to autocomplete format
            .map((group) => {
                return { id: group.name, value: group.name };
            })
    );
}

async function getServicePlans(query, pluginSettings, actionParams) {
    const { settings, params } = paramsMapper(pluginSettings, actionParams);

    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const client = new armAppService.WebSiteManagementClient(credentials, params.subscriptionId || settings.subscriptionId);

    const servicePlans = await client.appServicePlans.list();

    return servicePlans
    // Filter only groups matching query
    .filter(plan=> plan.name.toLowerCase().includes(query.toLowerCase()))
    // Map to autocomplete format
    .map(plan=>{
        return { id: plan.name, value: plan.name };
    });
}

async function getApps(query, pluginSettings, actionParams) {
    const { settings, params } = paramsMapper(pluginSettings, actionParams);

    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const client = new armAppService.WebSiteManagementClient(credentials, params.subscriptionId || settings.subscriptionId);

    const apps = await client.webApps.list();

    return apps
    // Filter only groups matching query
    .filter(app=> app.name.toLowerCase().includes(query.toLowerCase()))
    // Map to autocomplete format
    .map(app=>{
        return { id: app.name, value: app.name };
    });
}

async function getDeploymentSlots(query, pluginSettings, actionParams) {
    const { settings, params } = paramsMapper(pluginSettings, actionParams);
    
    const resourceGroupName = parsers.autocomplete(params.resourceGroupName);
    const appName = parsers.autocomplete(params.appName);

    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const client = new armAppService.WebSiteManagementClient(credentials, params.subscriptionId || settings.subscriptionId);

    
    const slots = await client.webApps.listSlots(resourceGroupName,appName);
    
    return slots
    // Filter only groups matching query
    .filter(slot=> slot.name.toLowerCase().includes(query.toLowerCase()))
    // Map to autocomplete format
    .map(slot=>{
        const [appName, slotName] = slot.name.split('/');
        return { id: slotName, value: slotName };
    });
}


module.exports = {
    getResourceGroups,
    getServicePlans,
    getDeploymentSlots,
    getApps
};