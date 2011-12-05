/* Copyright (c) 2006-2011 Regents of the University of Minnesota.
   For licensing terms, see the file LICENSE.
 */

package com.citizensense.android;

import java.util.ArrayList;

import android.app.ListActivity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.Button;
import android.widget.Gallery;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import com.citizensense.android.util.CampaignGalleryAdapter;
import com.citizensense.android.util.CampaignListAdapter;

/**
 * Abstract activity for displaying campaigns to the user
 * @author Phil Brown
 */
public abstract class CampaignExplorer extends ListActivity 
									   implements OnClickListener,
									              OnItemSelectedListener {

	/** Adapter for adding campaigns to the gallery*/
	protected CampaignGalleryAdapter galleryAdapter;
	
	/** Adapter for adding campaigns to the list*/
	protected CampaignListAdapter listAdapter;
	
	/** List of campaigns inflated by the view*/
	protected ArrayList<Campaign> campaigns;
	
	/** The gallery where the campaigns are stored in gallery mode*/
	protected Gallery gallery;
	
	/** The list where the campaigns are stored in list mode*/
	protected ListView list;
	
	/** Button indicating the way that the on-screen campaigns should be
	 * displayed. */
	protected Button listMode, galleryMode, mapMode;
	
	/** The current View within the set*/
	protected View current_gallery_view, current_list_view;
	/** The current position of the set*/
	protected int current_gallery_position, current_list_position;
		
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.campaign_explorer);
		//show list or gallery (and hide the other one)
		list = (ListView) findViewById(android.R.id.list);
		gallery = (Gallery) findViewById(R.id.campaign_gallery);
		registerForContextMenu(gallery);
		registerForContextMenu(list);
		gallery.setOnItemSelectedListener(this);
		gallery.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> parent, 
					                View view, 
					                int position,
					                long id) {
				Intent intent = new Intent(CampaignExplorer.this, CampaignPage.class);
				intent.putExtra(CampaignExplorer.this.getString(R.string.campaign_intent), 
						        campaigns.get(current_gallery_position));
				CampaignExplorer.this.startActivity(intent);
			}
		});
		list.setOnItemSelectedListener(new OnItemSelectedListener() {

			@Override
			public void onItemSelected(AdapterView<?> parent, 
					                  View view,
					                  int position, 
					                  long id) {
				current_list_view = view;
				current_list_position = position;
			}

			@Override
			public void onNothingSelected(AdapterView<?> arg0) {}
		});
		list.setOnItemClickListener(new OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> parent, 
					                View view, 
					                int position,
					                long id) {
				current_list_view = view;
				current_list_position = position;
				Intent intent = new Intent(CampaignExplorer.this, CampaignPage.class);
				intent.putExtra(CampaignExplorer.this.getString(R.string.campaign_intent), 
						        campaigns.get(current_list_position));
				CampaignExplorer.this.startActivity(intent);
			}
		});
		list.setVisibility(View.GONE);
		
		listMode = (Button) findViewById(R.id.view_as_list);
		listMode.setOnClickListener(this);
		galleryMode = (Button) findViewById(R.id.view_as_gallery);
		galleryMode.setOnClickListener(this);
		mapMode = (Button) findViewById(R.id.view_as_map);
		mapMode.setOnClickListener(this);
		//registerForContextMenu(G.map);
		
	}//onCreate
	
	@Override
	public void onResume() {
		super.onResume();
		refresh();
	}//onResume
	
	/** Get the campaigns to populate the list or gallery*/
	public abstract ArrayList<Campaign> getCampaigns();//getCampaigns
	
	/** Called when a view is clicked */
	@Override
	public void onClick(View v) {
		if (v == listMode) {
			gallery.setVisibility(View.GONE);
			list.setVisibility(View.VISIBLE);
		}
		else if (v == galleryMode) {
			list.setVisibility(View.GONE);
			gallery.setVisibility(View.VISIBLE);
		}
		else if (v == mapMode) {
			if (campaigns != null)
				G.globalCampaigns = campaigns;
			CitizenSense.openMap();
		}
	}//onClick
	
	@Override
    public void onItemSelected(AdapterView<?> parent, 
    		 				   View view,
    		 				   int position, 
    		 				   long id) {
    	current_gallery_view = view;
    	current_gallery_position = position;
    	updateIndicator(position);
    }//onItemSelected
	
	@Override
	public void onNothingSelected(AdapterView<?> arg0) {}//onNothingSelected
	
	/** Refresh the view and update the gallery index indicator */
	public void refresh() {
		//re-retrieve the campaigns. TODO move to non-UI thread
		campaigns = getCampaigns();
		this.refreshView();
	}//refresh
	
	/** 
	 * Set the campaigns stored in the list/gallery
	 * @param campaign
	 */
	public void setCampaigns(ArrayList<Campaign> campaigns) {
		this.campaigns = campaigns;
		this.refreshView();
	}//setCampaigns
	
	/** Refresh the Gallery and List Views to reflect changes made in
	 * {@link #refresh()} */
	private void refreshView() {
		if (campaigns != null) {
			listAdapter = new CampaignListAdapter(this, campaigns);
			setListAdapter(listAdapter);
			galleryAdapter = new CampaignGalleryAdapter(this, campaigns);
			gallery.setAdapter(galleryAdapter);
		}
	}//refreshView
	
	/** Update the index indicator at the bottom of the campaign view. 
	 * @param position the current gallery position */
	public void updateIndicator(int position) {
		int totalAdds = gallery.getCount();
		TextView temp;
		LinearLayout indicator = (LinearLayout) findViewById(R.id.gallery_index_indicator);
		indicator.removeAllViews();
		for (int i = 0; i < totalAdds; i++) {
			temp = new TextView(this);
			temp.setText("� ");
			temp.setGravity(Gravity.CENTER);
			if (i == position){
				temp.setTextColor(Color.BLUE);
			}
			else {
				temp.setTextColor(Color.LTGRAY);
			}
			indicator.addView(temp, i);
		}
	}//updateIndicator
	
}//CampaignExplorer