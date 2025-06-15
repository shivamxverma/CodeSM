#include<bits/stdc++.h> 
using namespace std; 
int main(){ 
  int n;cin>>n; 
  long long sum = (n*(n+1))/2;
  long long cur = 0;
  for(int i=0 ; i<n-1 ; i++){ 
    int x;cin>>x;
    cur += x;
  } 

  cout << sum-cur << endl;
  return 0;
}


