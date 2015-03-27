function Analyzer(data, partition_function, data_sort_function, bucket_sort_function)
{	
	var keys;
	var partition_function;
	var buckets = new Hashtable();
	var unit_width = 12;
	
	// Pluggable 
	//	
	if (!partition_function) {
		partition_function = function(datum) { return datum.Lvl_1; };	
	}	
	
	if (!data_sort_function) {
		data_sort_function = function(a, b) { return a.Aladdin_Account_ID.localeCompare(b.Aladdin_Account_ID)};	
	}
	
	if (!bucket_sort_function) {
		bucket_sort_function = function(a, b) { return a.localeCompare(b)};	
	}	

	// Returns the tick position within the corresponding bucket
	//
	this.bucketTickPosition = function(key) {
		var bucket_object = buckets.get(key);
		var x = (bucket_object.count + bucket_object.start_at) * unit_width;

		return x;
	}

	// Returns the x position 
	//
	this.x = function(item, index)
	{
		var bucket_key		= partition_function(item);
		var bucket_object	= buckets.get(bucket_key);
		var offset			= bucket_object.start_at;

		var x = (offset + item.bucket_position) * unit_width;

		return x;		
	}


	// Return the y value based on the exponential function
	// Val - is the z score 
	// If the val exceeds 3 sigma then set it to the max sigma value of 3
	//
	this.y = function(val, index)
	{		

		var yVal;
		var x = val;

		// setting an upper and lower bound sigma values
		//
		if (x >= 3) {
			x = 3
		}
		else if (x < -3) {
			x = -3
		}

		// compute the e^x where x is the z-score
		if (val >= 0) {
			yVal = Math.exp(x)
		}
		else {
			yVal =  -1 * Math.exp(-1 * x)		
		}

		return yVal;		
	}	

	// Return the color based on the z score value
	//
	this.color = function(zScore) {		
        if (zScore >= -1 && zScore <= 1)  {
            return "green";
        }
        else if (zScore >= -2 && zScore <= 2) {
            return "yellow"
        }
        else {                    
            return "purple"
        }       
	}

	// Sorting here is used to keep from having to do a second pass because we can 
	// tally each datum's position within the bucket due to the global ordering of the data.
	//
	var sorted_data  = data.sort(data_sort_function);

	// Spin through the data, tallying up the number of records that map to each bucket,
	// and record for each data item where it belongs, with regard to it's place in the bucket.
	//
	for (var i = 0; i < sorted_data.length; i++) 
	{
		var item      = sorted_data[i];
		var partition_key = partition_function(item);
		var bucket_object = buckets.get(partition_key);

		if (!bucket_object)
		{
			bucket_object = { count: 1, start_at: null};
			buckets.put(partition_key, bucket_object);
			item.bucket_position = 1;
		}
		else
		{
			var next = bucket_object.count + 1;

			bucket_object.count = next;
			item.bucket_position = next;
		}
	}

	// Now, run through the buckets, and tally the starting location of each one by keeping
	// a cumulative total of the data items.  Don't forget that we want to add an extra "phantom"
	// space between the data elements of each partition, so that there is a gap at the 
	// boundary between two buckets.

	var keys = buckets.keys();
	var sorted_buckets = keys.sort(bucket_sort_function);
	var accumulator = 1;	


	for (var i = 0; i < sorted_buckets.length; i++)
	{
		var partition_key = sorted_buckets[i];
		var bucket_object = buckets.get(partition_key);

		bucket_object.start_at = accumulator;
		accumulator += bucket_object.count + 1;
		
		bucket_object.end_at = accumulator - bucket_object.start_at;
		bucket_object.center = bucket_object.end_at / 2;
		bucket_object.partition_key = partition_key;		
	}	

}