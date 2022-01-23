/**
 * @author #ccffee
 * @data last change by #ccffee on 2021/10/5
 * @description 观察者模式实现
 */

import { EventSelf } from "../event";

const ALL_TYPE = 10131;

/**
 * 被观察者
 * 装饰器实现
 */
export function subject<T extends {new(...args:any[]):{}}>(constructor:T) {
    return class extends constructor {

        observerMap:Map<number, Map<Object, Map<Function, Function>>>;       //观察者列表
        addObserver(obs:Object, type:number, obsFunc:Function){                     //添加观察者
            if(type == null)type = ALL_TYPE;   //为null时监听所有事件                           
            if(!this.observerMap) this.observerMap = new Map<number, Map<Object, Map<Function, Function>>>();       //观察者列表
            if(!this.observerMap.get(type))this.observerMap.set(type, new Map);
            if(!this.observerMap.get(type).get(obs))this.observerMap.get(type).set(obs, new Map);
            this.observerMap.get(type).get(obs).set(obsFunc, obsFunc);
        }
        deleteObserver(obs:Object, type:number, obsFunc:Function){                   //删除观察者
            if(type == null)type = ALL_TYPE;   //为null时监听所有事件                     
            if(!this.observerMap) this.observerMap = new Map<number, Map<Object, Map<Function, Function>>>();       //观察者列表      
            if(!this.observerMap.get(type) || !this.observerMap.get(type).get(obs))return;
            this.observerMap.get(type).get(obs).delete(obsFunc);
            if(this.observerMap.get(type).get(obs).size == 0)this.observerMap.get(type).delete(obs);
            if(this.observerMap.get(type).size == 0)this.observerMap.delete(type);
        }
        notify(eventType:number, ...args:any[]){  
            if(!this.observerMap)return;
            if(this.observerMap.get(ALL_TYPE))
                this.observerMap.get(ALL_TYPE).forEach((funcMap, observer)=>{
                    funcMap.forEach(func=>{
                        func.call(observer, eventType, ...args);
                    })
                })
            if(!this.observerMap.get(eventType))return;
            this.observerMap.get(eventType).forEach((funcMap, observer)=>{
                if(eventType == EventSelf.LOAD_SPINE){
                    console.log(funcMap)
                }
                funcMap.forEach(func=>{
                    func.call(observer, ...args);
                })
            })

        }
    }
}

export class Observer{
    /**
     * 添加一个观察者
     * @param subject 
     * @param observer 
     * @param handle 
     * @param type 
     */
    public static onSubjectNotify(subject: Object, observer:Object, handle:Function, type?:number){
        subject.addObserver(observer, type, handle);
    }

    /**
     * 添加一个观察者，只观察一次
     * @param subject 
     * @param observer 
     * @param handle 
     * @param type 
     */
    public static onceSubjectNotify(subject: Object, observer:Object, handle:Function, type?:number){
        let handleOnce = (...args:any[])=>{
            handle.call(this, args);
            Observer.offSubjectNotify(subject, observer, handleOnce, type);
        }
        Observer.onSubjectNotify(subject, observer, handleOnce, type);
    }

    /**
     * 删除观察者
     * 删除一个事件监听
     * @param subject 
     * @param observer 
     */
    public static offSubjectNotify(subject:  Object, observer:Object, handle:Function, type?:number){
        subject.deleteObserver(observer, type, handle);
    }
}
