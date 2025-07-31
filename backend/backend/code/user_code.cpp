#include <string>
#include <iostream>
using namespace std;

int main(){

  while(true){
    
  }
  int n;cin>>n;
  long long sum = 90;
  for(int i=0 ; i<n ; i++){
    int x;cin>>x;
    sum += (x%2==0?x:1);
  }
  cout << "Hello" << endl;
}
