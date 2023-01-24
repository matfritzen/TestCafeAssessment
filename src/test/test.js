const { Selector } = require("testcafe");


fixture('Ninja One Assessment')
    .page('http://localhost:3001/');

test
    ("Test 1", async t => {

        const response = await t.request("http://localhost:3000/devices");
        
        await t
        .expect(response.status).eql(200)
        .expect(response.statusText).eql('OK');

        const data = response.body;

        const devices = await Selector('.device-name').count;
        var name = Selector('.device-name');
        var type = Selector('.device-type');
        var capacity = Selector('.device-capacity');
        var buttons = Selector('.device-options');
            
        if (devices > 0) {
            for(var i = 0; i < devices; i++){

                await t
                    .expect(name.withExactText(data[i]["system_name"]).visible).ok()
                    .expect(type.withExactText(data[i]["type"]).visible).ok()
                    .expect(capacity.withText(data[i]["hdd_capacity"]).visible).ok()
                    .expect(buttons.find('.device-edit').exists).ok()
                    .expect(buttons.find('.device-edit').visible).ok()
                    .expect(buttons.find('.device-remove').exists).ok()
                    .expect(buttons.find('.device-remove').visible).ok();
            }


        } 
        else {
            throw new Error('There are no devices in the list');
        }
    
    });

test("Test 2", async t => {

    const formTitle = Selector('.device-form').find('h3').innerText;
    const system_name_input = Selector('#system_name');
    const type_dropdown = Selector('#type');
    const capacity_input = Selector('#hdd_capacity');

    const system_name_value = "System Test "+Math.random(0, 1000)+"";
    let type_value = ["WINDOWS WORKSTATION", "WINDOWS SERVER", "MAC"];
    const capacity_value = 200;

    let deviceName = Selector('.device-info').find('span').withExactText(system_name_value);
    var deviceType = deviceName.sibling().withExactText(type_value[2]);
    var deviceCapacity = deviceName.sibling().withText(capacity_value.toString());

    await t
    .click(".submitButton")
    .expect(formTitle).eql('NEW DEVICE')
    .typeText(system_name_input, system_name_value)
    .click(type_dropdown)
    .click(type_dropdown.find('option').withExactText(type_value[2]))
    .typeText(capacity_input, capacity_value.toString())
    .click(".submitButton")
    .expect(deviceName.visible).ok()
    .expect(deviceType.visible).ok()
    .expect(deviceCapacity.visible).ok();

});

test("Test 3", async t => {


    //#region Getting the ID of the first device of the list

    var firstDeviceName = await Selector('div').withAttribute('class', 'device-info').nth(0).find('span').nth(0).innerText;
    const devices = await Selector('.device-name').count;

    let getFirstDeviceId;

    const responseGetId = await t.request('http://localhost:3000/devices');
    
    await t
    .expect(responseGetId.status).eql(200)
    .expect(responseGetId.statusText).eql('OK');


    const data = responseGetId.body;

    if(devices > 0){

        for(let i = 0; i < devices; i++){
    
            if(data[i]["system_name"] == firstDeviceName){
                getFirstDeviceId = data[i]["id"];
                break;
            }

        }
    }

    else {
        throw new Error('There are no devices in the list');
    }
    
    //#endregion

    const responseEdit = await t.request.put({
        url: "http://localhost:3000/devices/"+getFirstDeviceId+"",
        headers:{
            "Content-Type" : "application/json" 
        },
        body: {
            "system_name": "Renamed Device",
            "type": "WINDOWS",
            "hdd_capacity": "10"
        }
    });



    await t
    .expect(responseEdit.status).eql(200)
    .expect(responseEdit.statusText).eql("OK")
    .eval(() => location.reload(true));


    var firstDeviceNameUpdated = await Selector('div').withAttribute('class', 'device-info').nth(0).find('span').nth(0).innerText;
    
    await 
    t.expect(firstDeviceNameUpdated).eql('Renamed Device');


});

test("Test 4", async t => {

     //#region Getting the ID of the last device of the list

    var lastDeviceName = await Selector('div').withAttribute('class', 'device-info').nth(-1).find('span').nth(0).innerText;
    const devices = await Selector('.device-name').count;

    let getLastDeviceId;

    const responseGetId = await t.request('http://localhost:3000/devices');
    
    await t
    .expect(responseGetId.status).eql(200)
    .expect(responseGetId.statusText).eql('OK');

    const data = responseGetId.body;

    if(devices > 0){

        for(let i = 0; i < devices; i++){
    
            if(data[i]["system_name"] == await lastDeviceName){
                getLastDeviceId = data[i]["id"];
                break;
            }

        }
    }

    else {
        throw new Error('There are no devices in the list');
    }
    
//     //#endregion

    const responseDelete = await t.request.delete({
        url: "http://localhost:3000/devices/"+getLastDeviceId+""
    });


    await t
    .expect(responseDelete.status).eql(200)
    .expect(responseDelete.statusText).eql("OK")
    .eval(() => location.reload(true));

        
    await t
    .expect(await lastDeviceName.visible).notOk()
    .expect(await lastDeviceName.exists).notOk();

});
