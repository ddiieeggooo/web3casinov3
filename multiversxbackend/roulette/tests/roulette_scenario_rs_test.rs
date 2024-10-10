use multiversx_sc_scenario::*;

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    blockchain.register_contract("mxsc:output/roulette.mxsc.json", roulette::ContractBuilder);
    blockchain
}

#[test]
fn empty_rs() {
    world().run("scenarios/roulette.scen.json");
}
