// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EventSelf } from "./event";
import MainCom from "./test";
import { Observer, subject } from "./util/ObserveEvent";

const {ccclass, property} = cc._decorator;

@ccclass
@subject
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    nameEdit: cc.EditBox = null;

    // 主脚本
    mainTs: MainCom;

    buttons:Map<string, cc.Node>

    @property(cc.Node)
    content: cc.Node = null;


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.mainTs = this.node.getComponent("test");

        this.nameEdit.node.on('text-changed', this.onInput, this);

        this.buttons = new Map();

        Observer.onSubjectNotify(this.mainTs, this, (button:cc.Node)=>{
            this.buttons.set(button.name, button);
        }, EventSelf.BUTTON_CREATOR)
    }

    onInput(){
        //获取名称
        let name = this.nameEdit.string;

        name = name.toLowerCase()

        let buttons = this.buttons;

        buttons.forEach((button, buttonName)=>{
            if(name != '' && buttonName.toLowerCase().indexOf(name) == -1){
                // 改动
                button.setParent(this.node)
                button.setPosition(cc.v2(button.getPosition().x, 10000))
            }else{
                // 移回
                button.setParent(this.content)
            }
        })
    }

    start () {

    }

    // update (dt) {}
}
