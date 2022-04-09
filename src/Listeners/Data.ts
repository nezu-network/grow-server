import { PieceContext } from "@sapphire/pieces";
import { fromAsync, isErr } from "@sapphire/result";
import { Peer, Variant } from "growsockets";
import { Listener } from "../Stores/Listener";
import { DataTypes } from "../Utilities/Enums/DataTypes";
import ParseAction from "../Utilities/Functions/ParseAction";

export class Data extends Listener {
    public constructor(context: PieceContext) {
        super(context, {
            name: "data",
            event: "data"
        })
    }
    public async run(netID: number, data: Buffer) {
    const peer: Peer<{ netID: number }> = Peer.new(this.container.server, netID) as Peer<{ netID: number }>;
    
    const dataType = data.readUInt32LE();
    
    switch(dataType) {
        case DataTypes.STR:
        case DataTypes.ACTION: {
                const packetAction = ParseAction(data);
                const action = this.container.stores.get("actions").get(packetAction.get("action"));
                const isGuest = packetAction.has("requestedName");
                console.log(packetAction);

                /** TODO: HANDLE FOR USER GROWID VALIDATION */
                if (packetAction.has("requestedName") || packetAction.has("tankIDName")) {
                    peer.send(
                        Variant.from(
                            "OnSuperMainStartAcceptLogonHrdxs47254722215a",
                            this.container.server.data.items.hash,
                            "ubistatic-a.akamaihd.net",
                            "0098/63543/cache/",
                            "cc.cz.madkite.freedom org.aqua.gg idv.aqua.bulldog com.cih.gamecih2 com.cih.gamecih com.cih.game_cih cn.maocai.gamekiller com.gmd.speedtime org.dax.attack com.x0.strai.frep com.x0.strai.free org.cheatengine.cegui org.sbtools.gamehack com.skgames.traffikrider org.sbtoods.gamehaca com.skype.ralder org.cheatengine.cegui.xx.multi1458919170111 com.prohiro.macro me.autotouch.autotouch com.cygery.repetitouch.free com.cygery.repetitouch.pro com.proziro.zacro com.slash.gamebuster",
                            "proto=117|choosemusic=audio/mp3/spooky_tiki.mp3|active_holiday=9|server_tick=226933875|wing_week_day=0|server_tick=48726610|clash_active=0|drop_lavacheck_faster=1|isPayingUser=0|usingStoreNavigation=1|enableInventoryTab=1|bigBackpack=1|" 
                        ),
                        Variant.from("SetHasGrowID", isGuest ? 0 : 1, packetAction.get("tankIDName"), packetAction.get("tankIDPass"))
                    );
                    this.container.server.userGrowIdCache.set(peer.data.netID, isGuest ? packetAction.get("requestedName") : packetAction.get("tankIDName"));
                }
                
                if (action) {
                    const result = await fromAsync(() => action.run(peer, packetAction));
                    if (isErr(result)) {
                        peer.send(
                            Variant.from("OnConsoleMessage", `An error occured when running this action: ${result.error}`),
                        )
                    }
                }
            }
        }
    }
}