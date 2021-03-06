import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import {Document} from 'mongoose';

export default abstract class {
    private db;
    private schema;
    private reject_fields:object;

    constructor(DB){
        this.schema = this.buildSchema();
        this.db = DB.model(this.getName(), this.schema);

        this.reject_fields = _.extend({
            __v : false,
            createdAt : false
        }, this.rejectFields());
    }

    private buildSchema(){
        const schema = new mongoose.Schema(_.extend({
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }, this.getSchema()), {
            timestamps: true
        });

        return schema;
    }

    protected abstract getSchema(): mongoose.SchemaDefinition;
    protected abstract getName(): string;
    protected rejectFields(): object{
        return {};
    }

    public async save(doc: object): Promise<Document>{
        return await this.db.create(doc);
    }
    public async find(query, opts?): Promise<Document[]>{
        const option = this.buildFindOptions(opts);
        const reject_fields = option.reject ? this.reject_fields : {};
        return await this.db.find(query, reject_fields);
    }

    public async findOne(query, opts?): Promise<Document>{
        const option = this.buildFindOptions(opts);
        const reject_fields = option.reject ? this.reject_fields : {};
        return await this.db.findOne(query, reject_fields);
    }

    public async update(query, doc, opts?: updateOptions): Promise<Document>{
        return await this.db.update(query, doc, this.buildUpdateOptions(opts));
    }

    public async count(query): Promise<number>{
        return await this.db.count(query);
    }

    public getAggregate(){
        return this.db.aggregate();
    }

    public async remove(query){
        return await this.db.remove(query);
    }


    private buildUpdateOptions(opts?: updateOptions): updateOptions{
        return _.extend({
            multi : false
        }, opts||{});
    }
    private buildFindOptions(opts?: findOptions): findOptions{
        return _.extend({
            reject: true
        }, opts||{});
    }
}

interface updateOptions {
    multi?: boolean;
}
interface findOptions {
    reject?: boolean;
}
