package com.madrassa;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.util.Log;

import com.madrassa.util.Constants;


public class CourseDetailActivity extends AppCompatActivity{

	@Override
	public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_course_detail);

		int courseId = getIntent().getIntExtra(Constants.COURSE_ID, 0);

	}
}