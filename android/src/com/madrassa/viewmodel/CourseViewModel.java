package com.madrassa.viewmodel;

import android.app.Application;
import android.arch.lifecycle.AndroidViewModel;
import android.arch.lifecycle.LiveData;
import android.arch.lifecycle.MutableLiveData;
import android.support.annotation.NonNull;
import android.util.Log;

import io.reactivex.schedulers.Schedulers;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.Single;

import com.madrassa.AppRepository; 
import com.madrassa.response.CourseResponse;
import com.madrassa.response.BooleanResponse;
import com.madrassa.util.Constants;
import com.madrassa.MadrassaApplication;


public class CourseViewModel extends AndroidViewModel{

	private AppRepository repo;
	public MutableLiveData<CourseResponse> courseResponse = 
		new MutableLiveData<CourseResponse>();
	public MutableLiveData<BooleanResponse> joinCourseResponse = 
		new MutableLiveData<BooleanResponse>();
	public MutableLiveData<BooleanResponse> leaveCourseResponse =
		new MutableLiveData<BooleanResponse>();


	public CourseViewModel(@NonNull Application app){
		super(app);
		repo = AppRepository.getInstance(MadrassaApplication.getContext());
	}

	public void getCourse(int id){
		repo.getCourse(id)
		.subscribeOn(Schedulers.io())
		.observeOn(AndroidSchedulers.mainThread())
		.subscribe(courseResponse -> {
			// Log.i(Constants.TAG, courseResponse.toString());
			this.courseResponse.postValue(courseResponse);
		}, throwable -> {
			Log.i(Constants.TAG, "Error occurred");
		});
	}

	public void joinCourse(int courseId){
		repo.joinCourse(courseId)
		.subscribeOn(Schedulers.io())
		.observeOn(AndroidSchedulers.mainThread())
		.subscribe(booleanResponse ->{
			this.joinCourseResponse.postValue(booleanResponse);
		}, throwable ->{
			Log.i(Constants.TAG, "Error occurred");
		});
	}

	public void leaveCourse(int courseId){
		repo.leaveCourse(courseId)
		.subscribeOn(Schedulers.io())
		.observeOn(AndroidSchedulers.mainThread())
		.subscribe(booleanResponse ->{
			this.leaveCourseResponse.postValue(booleanResponse);
		}, throwable ->{
			Log.i(Constants.TAG, "Error occurred");
		});
	}
}