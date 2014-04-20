package org.folksource.model;

import com.vividsolutions.jts.geom.Geometry;
import java.sql.Timestamp;

public class Location{
	public Integer id;
	public Integer task_id;
	public Timestamp server_timestamp;
//	@Exclude(ExcludeType.EXPORT)
	private Geometry geometry;
	
	public Location() {
		
	}
	
	public Location(Integer id2, Integer task_id2, Geometry geometry2, String server_timestamp) { //TODO: make sure when initially instantiated has server time, but doesn't change when called from DB
		this.id = id2;
		this.task_id = task_id2;
		this.geometry = geometry2; 
		this.server_timestamp = new Timestamp(2004-10-19 10:23:54);  //TODO: chance this to current server date... TODO: change psql to timestamp w/o time zone
	}
	public Integer getId() {
		return this.id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public Integer getTask_id() {
		return this.task_id;
	}
	public void setTask_id(Integer task_id){
		this.task_id = task_id;
	}
	public String getServer_timestamp(){
		return this.server_timestamp;
	}
	public void setServer_timestamp(String server_timestamp){
		this.server_timestamp = server_timestamp;
	}
	
	public Geometry getGeometry() {
		return geometry;
	}

	public void setGeometry(Geometry geometry) {
		this.geometry = geometry;
	}
}


